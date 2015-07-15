    define(['jquery'], function($){
    var SmartresponderWidget = function () {
        var _this = this,
            Sr; //Helper object
        console.log(_this.get_settings());
        Sr = {
            settings : _this.get_settings(),
            say : function(code){
                return _this.i18n(code) || '';
            },
            get : {
              deliveries : function(){
                console.log('get deliveries');
              },
              groups : function(){
                console.log('get groups');
              }
            },
            validate : {
                apiKey : function(){
                    return false;
                }
            },
            showError : function(message){
                console.log(Sr.settings);
                var  errors = AMOCRM.notifications,
                    date_now = Math.ceil(Date.now()/1000),
                    n_data = {
                        header: Sr.say('other.notificationHeader')+': '+message.title,
                        text:'<p>'+message.body+'</p>',
                        date: date_now
                    },
                    callbacks = { done: function(){console.log('done');},
                        fail: function(){console.log('fail');},
                        always: function(){console.log('always');}
                    };

                errors.add_error(n_data,callbacks);
            },
            clearInputErrors: function(element){
                var error = element.find(".sr_widget_input_error");
                if(error.length == 0)
                    return true;

                 var elementHeight = element.outerHeight(true),
                    errorHeight = error.outerHeight(true),
                    newHeight = elementHeight-errorHeight,
                    styleAttr = element.attr('style');

                element.css('height', elementHeight+'px');
                error.fadeOut(200, function(){
                    element.animate({'height': newHeight+'px'}, 200, 'linear', function(){
                        element.clearQueue().find(".sr_widget_input_error").remove();
                        if(typeof styleAttr === 'undefined')
                            element.removeAttr('style');
                        else
                            element.attr('style', styleAttr);
                    });
                });
            },
            appendInputError : function(element, message){
                var errorsElements = element.find('.sr_widget_input_error');
                if(errorsElements.length > 0){
                    errorsElements.eq(0).text(message);
                    return true;
                }

                var elementHeight = element.height(),
                    styleAttr = element.attr('style');

                //add invisible fake container to get error height. Needed for easing.
                element.css('position', 'relative').append('<div style="position: absolute; top: -5000px" id="fake_ph"><p id="fake_error" class="sr_widget_input_error" style="color: #F00; padding-top: 15px;">' + message + '</p></div>')
                var errorHeight = $("#fake_error").outerHeight(true),
                    newHeight = errorHeight + elementHeight;

                $("#fake_ph").remove();
                element.clearQueue().animate({'height': newHeight+'px'}, 200, 'linear', function(){
                    element.append('<p class="sr_widget_input_error" style="color: #F00; padding-top: 15px;display: none;">' + message + '</p>');
                    element.find('.sr_widget_input_error').fadeIn(200);
                    if(typeof styleAttr === 'undefined')
                        element.removeAttr('style');
                    else
                        element.attr('style', styleAttr);
                });
                element.find(".sr_widget_input_error").hide();
            }
        }


        this.callbacks = {
            render: function(){
                var lang = _this.i18n('userLang'),
                    widgetSettings = _this.get_settings(),
                    widgetPath = widgetSettings.path;

                if(typeof(AMOCRM.data.current_card)!='undefined'){
                    if(AMOCRM.data.current_card.id == 0) {
                        return false;
                    } // do not render if action is "add"
                }

                _this.render_template({
                    caption:{
                        class_name:'js-ac-caption',
                        html:''
                    },
                    body:'',
                    render :  '\
                   <div class="sr-form">\
                        <select name="">\
                            <option value="1">1</option>\
                            <option value="1">2</option>\
                        </select>\
                        <div class="sr-form-button sr-sub">\
                            <button type="button" class="button-input  button-input-disabled js-card-quick-lead-add" tabindex="" id="quick_add_form_btn">\
                                <span class="button-input-inner ">\
                                    <span class="button-input-inner__text"></span>\
                                </span>\
                            </button>\
                       </div>\
                   </div>\
                   <div class="ac-already-subs"></div>\
                   <link type="text/css" rel="stylesheet" href="'+widgetPath+'/main.css" >'
                });
                return true;
            },
            init: function(){
                Sr.get.groups();
                console.log('init');
                return true;
            },
            bind_actions: function(){
                console.log('bind_actions');
                return true;
            },
            settings: function(){
                return true;
            },
            onSave: function(data){
                if(data.active == 'Y'){
                    var button = $('.js-widget-save'),
                        apiKeyContainer = $('input[name="api_key"]').closest('.widget_settings_block__item_field');

                    if(!Sr.validate.apiKey()){
                        _this.set_status('error');
                        button.trigger('button:save:error');
                        Sr.appendInputError(apiKeyContainer, Sr.say('other.errors.apiKey.short'));
                    }
                    else{
                        Sr.clearInputErrors(apiKeyContainer);
                    }
                }
                return false;
            },
            destroy: function(){

            },
            contacts: {
                //select contacts in list and clicked on widget name
                selected: function(){
                    console.log('contacts');
                }
            },
            leads: {
                //select leads in list and clicked on widget name
                selected: function(){
                    console.log('leads');
                }
            },
            tasks: {
                //select taks in list and clicked on widget name
                selected: function(){
                    console.log('tasks');
                }
            }
        };
        return this;
    };

    return SmartresponderWidget;
});