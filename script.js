    define(['jquery'], function($){
    var SmartresponderWidget = function () {
        var _this = this,
            Sr; //Helper object

        Sr = {
            say : function(code){
                return _this.i18n(code) || '';
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
            onSave: function(){
                alert('click new');
                return true;
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