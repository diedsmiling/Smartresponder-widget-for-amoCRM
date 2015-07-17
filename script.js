define( [ "jquery" ], function( $ ) {
    var SmartresponderWidget = function() {
        var _this = this,
            authorised,
            Sr; //Helper object
        Sr = {
            settings: _this.get_settings(),
            notifications: AMOCRM.notifications,
            dateNow: Math.ceil( Date.now() / 1000 ),
            apiBaseUrl: "http://api.smartresponder.ru",
            say: function( code ) {
                return _this.i18n( code ) || ""
            },
            buildSelect: {
                srEnitites: function( entityName ) {
                    _this.crm_post( Sr.apiBaseUrl +
                            ( entityName == "deliveries" ?
                                "/deliveries.html"
                                    :
                                "/groups.html" ),
                        {
                            format: "json",
                            action: "list",
                            api_key: _this.get_settings().api_key
                        },
                        function( result ) {
                            if ( result.result == "0" ) {
                                Sr.showNotification( Sr.say( "other.errors.badAjax" ) );
                            }else {
                                var entities = [],
                                    domContainer = (
                                        entityName == "deliveries" ?
                                            $( "#sr-deliveries-container" )
                                                :
                                            $( "#sr-groups-container" )
                                    );
                                $.each( result.list.elements, function( key, element ) {
                                    entities.push( {
                                        id: element.id,
                                        option: element.title
                                    } )
                                } );
                                domContainer
                                    .html( _this.render( {
                                        ref: "/tmpl/controls/select.twig"
                                    },
                                    {
                                        items: entities,
                                        class_name: "sr-" + entityName + "-select"
                                    }
                                ) );
                            }
                        },
                        "json",
                        function( error ) {
                            Sr.showNotification( Sr.say( "other.errors.badAjax.short" ) );
                        }
                    );
                },
                emails: function() {
                    var emails = [] ;

                    $.each(
                        $( ".card-cf-table-main-entity .email_wrapper input[type=text]:visible" ),
                        function( key, el ) {
                            if ( Sr.validate.email( el.value ) ) {
                                emails.push( {
                                    id: el.value,
                                    option: el.value
                                } );
                            }
                        } );

                    $( "#sr-emails-container" )
                        .html( _this.render( {
                            ref: "/tmpl/controls/select.twig"
                        },
                        {
                            items: emails,
                            class_name: "sr-emails-select"
                        }
                    ) );
                }
            },
            validate: {
                email: function( email ) {
                    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    return re.test( email );
                },
                apiKey: function( apiKey ) {
                    var button = $( ".js-widget-save" ),
                        apiKeyContainer = $( "input[name='api_key']" )
                            .closest( ".widget_settings_block__item_field" );
                    _this.crm_post( Sr.apiBaseUrl + "/account.html",
                        {
                            format: "json",
                            action: "info",
                            api_key: apiKey
                        },
                        function( result ) {
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
                        "json",
                        function( error ) {
                            Sr.appendInputError( apiKeyContainer,
                                Sr.say( "other.errors.badAjax.short" ) );
                            return false;
                        }
                    );

                }
            },
            showNotification: function( message ) {
                var data = {
                    id: Math.floor( ( Math.random() * 100000 ) + 1 ),
                    header: Sr.say( "other.notificationHeader" ) + ": '" + message.title,
                    text:"<p>" + message.body + "</p>",
                    date: Sr.dateNow
                };
                Sr.notifications.add_error( data );
            },
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
                        } );
                } );
            },
            appendInputError: function( element, message ) {
                var errorsElements = element.find( ".sr_widget_input_error" );
                if ( errorsElements.length > 0 ) {
                    errorsElements.eq( 0 ).text( message );
                    return true;
                }

                var elementHeight = element.height(),
                    styleAttr = element.attr( "style" );

                //add invisible container to get error height. Needed for easing.
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
        }

        this.callbacks = {
            render: function() {
                var lang = _this.i18n( "userLang" ),
                    widgetSettings = _this.get_settings(),
                    widgetPath = widgetSettings.path;

                if ( typeof AMOCRM.data.current_card != "undefined" ) {
                    if ( AMOCRM.data.current_card.id == 0 ) {
                        return false;
                    } // do not render if action is "add"
                }

                _this.render_template( {
                    caption:{
                        class_name: "js-ac-caption",
                        html: ""
                    },
                    body: "",
                    render:  "" +
                    "<div class=\"sr-form\">" +
                    "   <div id=\"sr-emails-container\"></div>" +
                    "   <div id=\"sr-deliveries-container\"></div>" +
                    "   <div id=\"sr-groups-container\"></div>" +
                    "   <div id=\"sr-subscribe-button-container\"></div>" +
                    "</div>" +
                    "<div class=\"ac-already-subs\"></div>" +
                    "<link type=\"text/css\" " +
                    "       rel=\"stylesheet\" href=\"" + widgetPath + "/main.css\" >"
                } );

                $( "#sr-subscribe-button-container" )
                    .html( _this.render( {
                            ref: "/tmpl/controls/button.twig"
                        },
                        {
                            text: Sr.say( "other.subscribe" ),
                            id: "sr-subscribe-button"
                        }
                    ) );

                return true;
            },
            init: function() {
                Sr.buildSelect.emails();
                Sr.buildSelect.srEnitites( "deliveries" );
                Sr.buildSelect.srEnitites( "groups" );
                return true;
            },
            bind_actions: function() {
                console.log( "bind_actions" );
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
            contacts: {//select contacts in list and clicked on widget name
                selected: function() {
                    console.log( "contacts" );
                }
            },
            leads: {//select leads in list and clicked on widget name
                selected: function() {
                    console.log( "leads" );
                }
            },
            tasks: {//select tasks in list and clicked on widget name
                selected: function() {
                    console.log( "tasks" );
                }
            }
        };
        return this;
    };

    return SmartresponderWidget;
} );