define( [ "jquery" ], function( $ ) {
    var SmartresponderWidget = function() {
        var _this = this,
            authorised,
            Sr; //Helper object

        Sr = {
            entitiesAmount: {
                "deliveries": 0,
                "groups": 0
            },
            emailsCount: 0,
            contactsToImport: [],
            fRequestErrorsCommited: false,
            settings: _this.get_settings(),
            notifications: AMOCRM.notifications,
            dateNow: Math.ceil( Date.now() / 1000 ),
            apiBaseUrl: "https://api.smartresponder.ru",
            say: function( code ) {
                return _this.i18n( code ) || ""
            },
            /**
             * Gets amount of emails, form selected contacts
             */
            getEmailsAmount: function() {
                var url = Sr.buildLocalRequestUrl( "count", true );
                var data = {
                    amouser: _this.system().amouser,
                    amohash: _this.system().amohash,
                    contacts: Sr.contactsToImport,
                    sr_debug: 1
                };

                var success = function( result ) {
                    if ( result.result == "0" ) {
                        Sr.showNotification( Sr.say( "other.errors.badAjax" ) );
                    }else {
                        $( "#sr-contacts-amount" ).after( " " + result.amount ).remove();
                    }
                };

                var error =  function( error ) {
                    Sr.showNotification( Sr.say( "other.errors.badAjax" ) );
                    if ( entityName == "groups" ) {
                        fadeSpinnerIcon();
                    }
                };
                Sr.request.do( url, data, success, error, true );
            },
            /**
             * Gets emails from contact page
             * @returns {boolean}
             */
            getEmails: function() {
                var emails = [],
                emailContainers = $( ".card-cf-table-main-entity" )
                    .find( ".email_wrapper input[type=text]:visible" );

                $.each(
                    emailContainers,
                    function( key, el ) {
                        if ( Sr.validate.email( el.value ) ) {
                            emails.push( {
                                id: el.value,
                                option: el.value
                            } );
                        }
                    } );

                return emails.length == 0 ? false : emails;
            },
            /**
             * Builds url for local requests
             * @param {string} action
             * @returns {string}
             */
            buildLocalRequestUrl: function( action, devMode ) {
                var url = ( devMode == true ? "http://iamaplayer.ru/" : "/widgets/" )  +
                    _this.system().subdomain +
                    "/loader/" +
                    _this.get_settings().widget_code +
                    "/" + action;

                return url;
            },
            request: {
                /**
                 * Makes ajax request
                 *
                 * @param {string} url
                 * @param {object} data
                 * @param {function} success
                 * @param {function} error
                 * @param {bool} useProxy
                 */
                do: function( url, data, success, error, useProxy ) {
                   if ( useProxy == true ) {
                       _this.crm_post( url, data, success, "json", error );
                   } else {
                       $.ajax( {
                           method: "POST",
                           url: url,
                           data: data,
                           success: success,
                           error: error,
                           dataType: "json"
                       } );
                   }
                }
            },
            render: {
                /**
                 * Renders AMOCRM internal button
                 */
                button: function() {
                    $( "#sr-subscribe-button-container" )
                        .html(
                            _this.render( { ref: "/tmpl/controls/button.twig" },
                                { text: Sr.say( "other.subscribe" ),
                                    id: "sr-subscribe-button" } )
                        );
                },
                /**
                 * Renders message at SR form
                 * @param {string} message
                 * @param {bool} fAppend
                 */
                appendToForm: function( message, fAppend ) {
                    if ( fAppend ) {
                        $( ".sr-form" ).append( message );
                    } else {
                        $( ".sr-form" ).html( message );
                    }
                }
            },
            /**
             * Gets selected emails
             */
            getSelectedEmails: function() {
                Sr.contactsToImport
                    .push( $( ".sr-emails-select .control--select--input" ).attr( "value" ) );
            },
            buildSelect: {
                /**
                 * Builds AMOCRM internal selects with list of SR entities(groups or deliveries)
                 * @param {string} entityName
                 */
                srEntities: function( entityName ) {
                    var url = Sr.apiBaseUrl +
                        ( entityName == "deliveries" ?
                            "/deliveries.html"
                            :
                            "/groups.html" );

                    var data = {
                        format: "json",
                        action: "list",
                        api_key: _this.get_settings().api_key
                    };

                    /**
                     * Actions on successful request (gets entities)
                     * @param result
                     */
                    var success = function( result ) {
                        var fadeSpinnerIcon = function() {
                            $( "#sr-centred-animation-icon" ).fadeOut( 300, function() {
                                $( ".spinner-wrapper" ).animate(
                                    { height: "0px" },
                                    200,
                                    "linear",
                                    function() {
                                        $( this ).remove();
                                    }
                                );
                            } );
                        };
                        if ( result.result == "0" ) {
                            Sr.fRequestErrorsCommited = true;
                            Sr.showNotification( Sr.say( "other.errors.badAjax" ) );
                        }else {
                            var entities = [
                                    {
                                        id: 0,
                                        option: Sr
                                            .say( "other." +
                                            entityName + "SelectDefaultOption" )
                                    }
                                ],
                                domContainer = (
                                    entityName == "deliveries" ?
                                        $( "#sr-deliveries-container" )
                                        :
                                        $( "#sr-groups-container" )
                                );

                            if ( result.list.count > 0 ) {
                                if ( entityName == "deliveries" ) {
                                    Sr.entitiesAmount.deliveries =  result.list.count;
                                } else {
                                    Sr.entitiesAmount.groups =  result.list.count;
                                }

                                $.each( result.list.elements, function( key, element ) {
                                    entities.push( {
                                        id: element.id,
                                        option: element.title
                                    } )
                                } );

                                domContainer.animate(
                                    { height: "35px" },
                                    200,
                                    "linear",
                                    function() {
                                        var htmlRendered = _this.render( {
                                                ref: "/tmpl/controls/select.twig"
                                            },
                                            {
                                                items: entities,
                                                class_name: "sr-" +
                                                entityName + "-select opacity-zero"
                                            }
                                        );
                                        domContainer.html( htmlRendered );
                                        setTimeout( function() {
                                            $( ".sr-" + entityName + "-select" )
                                                .addClass( "opacity-trans" )
                                        }, 100 );
                                    }
                                )

                            }
                        }
                        if ( entityName == "groups" ) {
                            var msg = Sr.fRequestErrorsCommited == true ?
                                Sr.say ( "other.errors.badAjax.short" )
                                :
                                Sr.say ( "other.emptyGroupsAndDeliveries" );
                            fadeSpinnerIcon();
                            if ( Sr.entitiesAmount.deliveries == 0 &&
                                Sr.entitiesAmount.groups == 0 ) {
                                Sr.render.appendToForm( "<p>" + msg + "</p>" );
                            }
                        }
                    };

                    /**
                     * Actions on failed request (getting entities)
                     * @param error
                     */
                    var error =  function( error ) {
                        Sr.showNotification( Sr.say( "other.errors.badAjax" ) );
                        if ( entityName == "groups" ) {
                            fadeSpinnerIcon();
                        }
                    };

                    Sr.request.do( url, data, success, error, true );
                },
                /**
                 * Builds AMOCRM internal selects with list of emails
                 * @param {string} entityName
                 */
                emails: function( emails ) {

                    $( "#sr-emails-container" )
                        .html(
                            _this.render( {
                                ref: "/tmpl/controls/select.twig"
                            },
                            {
                                items: emails,
                                class_name: "sr-emails-select"
                            } )
                    );
                }
            },
            validate: {
                /**
                 * Validates email-address
                 * @param {string} email
                 * @returns {boolean}
                 */
                email: function( email ) {
                    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    return re.test( email );
                },
                /**
                 * Validates api key, sending request to SR
                 * @param {string} apiKey
                 */
                apiKey: function( apiKey ) {
                    var button = $( ".js-widget-save" ),
                        apiKeyContainer = $( "input[name='api_key']" )
                            .closest( ".widget_settings_block__item_field" );

                    var url = Sr.apiBaseUrl + "/account.html",
                        data = {
                            format: "json",
                            action: "info",
                            api_key: apiKey
                        },
                        success = function( result ) {
                            if ( result.result == "0" ) {
                                _this.set_status( "error" );
                                button.trigger( "button:save:error" );
                                var msg = (
                                    result.error.code == "-1.1" ?
                                        Sr.say( "other.errors.apiKey.short" )
                                        :
                                        Sr.say( "other.errors.badAjax.short" )
                                );
                                Sr.appendInputError( apiKeyContainer, msg );
                            }else {
                                Sr.clearInputErrors( apiKeyContainer );
                                _this.set_status( "installed" );
                                authorised = true;
                                $( ".js-widget-save" ).click();
                            }
                        },
                        error = function( error ) {
                            Sr.appendInputError( apiKeyContainer,
                                Sr.say( "other.errors.badAjax.short" ) );
                            return false;
                        };

                    Sr.request.do( url, data, success, error, true );
                }
            },
            /**
             * Shows AMOCRM internal error
             * @param {object} message
             */
            showNotification: function( message ) {
                var data = {
                    id: Math.floor( ( Math.random() * 100000 ) + 1 ),
                    header: Sr.say( "other.notificationHeader" ) + ": '" + message.title,
                    text:"<p>" + message.body + "</p>",
                    date: Sr.dateNow
                };
                Sr.notifications.add_error( data );
            },
            /**
             * Deletes error elements
             * @param {object} element container element
             * @returns {boolean}
             */
            clearInputErrors: function( element ) {
                var error = element.find( ".sr_widget_input_error" );
                if ( error.length == 0 ) {
                    return true;
                }
                var elementHeight = element.outerHeight( true ),
                    errorHeight = error.outerHeight( true ),
                    newHeight = elementHeight - errorHeight,
                    styleAttr = element.attr( "style" );

                element.css( "height", elementHeight + "px" );
                error.fadeOut( 200, function() {
                    element.animate(
                        { "height": newHeight + "px" },
                        200,
                        "linear",
                        function() {
                            element.clearQueue().find( ".sr_widget_input_error" ).remove();
                            if ( typeof styleAttr === "undefined" ) {
                                element.removeAttr( "style" );
                            } else {
                                element.attr( "style", styleAttr );
                            }
                        }
                    );
                } );
            },
            /**
             * Renders error alert near input field
             * @param {object} element container-element
             * @param {string} message Error message
             */
            appendInputError: function( element, message ) {
                var errorsElements = element.find( ".sr_widget_input_error" );
                if ( errorsElements.length > 0 ) {
                    errorsElements.eq( 0 ).text( message );
                    return true;
                }

                var elementHeight = element.height(),
                    styleAttr = element.attr( "style" );

                /* add invisible container to get error height. Needed for easing. */
                element.css( "position", "relative" ).append(
                    "<div style=\"position: absolute; top: -5000px\" id=\"fake_ph\">" +
                    "  <p id=\"fake_error\" class=\"sr_widget_input_error\" " +
                    "   style=\"color: #F00; padding-top: 15px;\">" +
                        message +
                    "</p></div>" );

                var errorHeight = $( "#fake_error" ).outerHeight( true ),
                    newHeight = errorHeight + elementHeight;

                $( "#fake_ph" ).remove();
                element.clearQueue().animate(
                    { "height": newHeight + "px" },
                    200,
                    "linear",
                    function() {
                        element.append(
                            '<p class="sr_widget_input_error" ' +
                            '   style="color: #F00; padding-top: 15px;display: none;">' +
                                message +
                            "</p>" );
                        element.find( ".sr_widget_input_error" ).fadeIn( 200 );
                        if ( typeof styleAttr === "undefined" ) {
                            element.removeAttr( "style" );
                        }else {
                            element.attr( "style", styleAttr );
                        }
                    } );
                element.find( ".sr_widget_input_error" ).hide();
            }
        };

        this.callbacks = {
            render: function() {
                var lang = _this.i18n( "userLang" ),
                    widgetSettings = _this.get_settings(),
                    widgetPath = widgetSettings.path;

                if ( typeof AMOCRM.data.current_card != "undefined" ) {
                    if ( AMOCRM.data.current_card.id == 0 ) {
                        return false;
                    } /* do not render if action is "add" */
                }

                _this.render_template( {
                    caption:{
                        class_name: "js-ac-caption",
                        html: ""
                    },
                    body: "",
                    render:  "" +
                    "<div class=\"sr-form\">" +
                    "   <div class=\"sr-block\" id=\"sr-emails-container\"></div>" +
                    "   <div class=\"sr-block\" id=\"sr-deliveries-container\"></div>" +
                    "   <div class=\"sr-block\" id=\"sr-groups-container\"></div>" +
                    "   <div class=\"sr-block\" id=\"sr-subscribe-button-container\"></div>" +
                    "</div>" +
                    "<div class=\"ac-already-subs\"></div>" +
                    "<link type=\"text/css\" " +
                    "       rel=\"stylesheet\" href=\"" + widgetPath + "/main.css\" >"
                } );

                return true;
            },
            init: function() {
                var emails = Sr.getEmails();
                Sr.render
                    .appendToForm(
                        $( "<span class=\"spinner-wrapper\">" +
                                "<span id=\"sr-centred-animation-icon\" " +
                                "class=\"spinner-icon\"></span>" +
                            "</span>" ),
                        true
                );
                if ( emails ) {
                    Sr.buildSelect.emails( emails );
                    Sr.buildSelect.srEntities( "deliveries" );
                    Sr.buildSelect.srEntities( "groups" );
                    Sr.render.button();
                    $( "#sr-subscribe-button" ).addClass( "button-input-disabled" );
                } else {
                    Sr.render.appendToForm( "<p>" + Sr.say( "other.emptyEmails" ) + "</p>", false );
                }
                return true;
            },
            bind_actions: function() {
                var deliveryId, groupId, selectedValues = [];
                $ ( document )
                    .on( "change", ".sr-deliveries-select, .sr-groups-select", function() {
                        $.each(
                            [ $( ".sr-deliveries-select" ), $( ".sr-groups-select" ) ],
                            function() {
                                selectedValues
                                    .push( $( this )
                                        .find( ".control--select--input" ).attr( "value" ) );
                            }
                        );
                        deliveryId = selectedValues[0];
                        groupId = selectedValues[1];
                        if ( deliveryId  != 0 || groupId != 0 ) {
                            $( "#sr-subscribe-button" ).removeClass( "button-input-disabled" );
                        } else {
                            $( "#sr-subscribe-button" ).addClass( "button-input-disabled" );
                        }
                        selectedValues = [];
                    } );

                $( document ).off( "click", "#sr-subscribe-button" )
                    .on( "click", "#sr-subscribe-button", function() {
                        var sendingIds = 1;
                        var contactName = 0;

                        if ( $( this ).hasClass( "button-input-disabled" ) ) {
                            return false;
                        }
                        $( "#sr-subscribe-button" ).html( "<span class=\"spinner-icon\"></span>" );
                        var url = Sr.buildLocalRequestUrl( "import", true );

                        var deliveryDestination =
                            $( ".sr-deliveries-select .control--select--input" )
                                .attr( "value" );
                        var groupDestination = $( ".sr-groups-select .control--select--input" )
                            .attr( "value" );

                        /* if single contact export */
                        if ( Sr.contactsToImport == 0 ) {
                            Sr.getSelectedEmails();
                            sendingIds = 0;
                            contactName = $( "#person_name" ).attr( "value" );
                        }

                        var data = {
                            api_key: _this.get_settings().api_key,
                            amouser: _this.system().amouser,
                            amohash: _this.system().amohash,
                            contacts: Sr.contactsToImport,
                            sr_debug: "1",
                            contact_name: contactName,
                            sending_ids: sendingIds,
                            delivery_destination: deliveryDestination,
                            group_destination: groupDestination
                        };

                        var success = function( result ) {
                            var interval = null;
                            var msg;
                            if ( result.result < 1 || result.error == 1 ) {

                                Sr.render
                                    .appendToForm( "<p>" +
                                        Sr.say( "other.errors.badAjax.short" ) + "</p>", false );
                            }

                            if ( result.result == 1 ) {
                                var importKey = result.element.import_key;
                                var url = Sr.buildLocalRequestUrl( "watch", true );
                                var data = {
                                    api_key: _this.get_settings().api_key,
                                    amouser: _this.system().amouser,
                                    amohash: _this.system().amohash,
                                    import_key: importKey,
                                    sr_debug: 1
                                };

                                var success = function( result ) {
                                    if ( result.result < 1 || result.error == 1 ) {

                                        Sr.render
                                            .appendToForm( "<p>" +
                                                Sr.say( "other.errors.badAjax.short" ) +
                                            "</p>", false );
                                    }

                                    if ( result.result == 1 ) {
                                        if ( result.element.progress == 100 ) {
                                            if ( result.element.ticket == "----------" ) {
                                                msg = Sr.say( "other.success" );
                                            } else {
                                                msg = Sr.say( "other.successWithTicket" )
                                                    .replace( "[TICKETID]", result.element.ticket );
                                            }
                                            Sr.render
                                                .appendToForm( "<p>" + msg + "</p>", false );

                                            clearInterval( interval );
                                        }
                                    }
                                };

                                var error = function() {
                                    Sr.render
                                        .appendToForm( "<p>" +
                                        Sr.say( "other.errors.badAjax.short" ) + "</p>", false );
                                }

                               interval = setInterval( function() {
                                    Sr.request.do( url, data, success, error, true );
                                }, 1000 );
                            }
                        };

                        var error = function() {
                            Sr.render
                                .appendToForm( "<p>" +
                                Sr.say( "other.errors.badAjax.short" ) + "</p>", false );
                        };

                        $( this ).empty()
                            .html( '<div style="margin:0 auto;" class="spinner-icon"></div>' );
                        Sr.request.do( url, data, success, error, true );
                        return false;
                } );

                $( "#multi-widget_close" ).on( "click", function() {
                    _this.widgetsOverlay( false );
                } );
                return true;
            },
            settings: function() {
                return true;
            },
            onSave: function( data ) {
                if ( authorised ) {
                    authorised = false;
                    return true;
                }
                if ( data.active == "Y" ) {
                    Sr.validate.apiKey( data.fields.api_key );
                } else {
                    authorised = false;
                    return true;
                }

            },
            destroy: function() {

            },
            contacts: {/* select contacts in list and clicked on widget name */
                selected: function() {
                    Sr.render.appendToForm(
                        "<div class=\"sr-block\"><p></p>" +
                            Sr.say( "other.emailsSelected" ) +
                        "<span id=\"sr-contacts-amount\"" +
                        " class=\"sr_inline_spinner spinner-icon\"></span></p></div>" +
                        "<div class=\"sr-block\" id=\"sr-deliveries-container\"></div>" +
                        "<div class=\"sr-block\" id=\"sr-groups-container\"></div>" +
                        "<div class=\"sr-block\" id=\"sr-subscribe-button-container\"></div>"
                    );
                    Sr.render
                        .appendToForm(
                        $( "<span class=\"spinner-wrapper\">" +
                                "<span id=\"sr-centred-animation-icon\" " +
                                "class=\"spinner-icon\"></span>" +
                            "</span>" ),
                        true
                    );
                    Sr.buildSelect.srEntities( "deliveries" );
                    Sr.buildSelect.srEntities( "groups" );
                    Sr.render.button();
                    $( "#sr-subscribe-button" ).addClass( "button-input-disabled" );
                    Sr.contactsToImport = [];
                    var selectedData = _this.list_selected();
                    Sr.emailsCount = 0;
                    $.each( selectedData.selected,  function( key, element ) {
                        Sr.contactsToImport.push( element.id );
                    } );

                    Sr.getEmailsAmount();

                }
            },
            leads: {//select leads in list and clicked on widget name
                selected: function() {
                }
            },
            tasks: {//select tasks in list and clicked on widget name
                selected: function() {
                }
            }
        };
        return this;
    };

    return SmartresponderWidget;
} );