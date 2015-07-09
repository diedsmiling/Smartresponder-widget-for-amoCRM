define(['jquery'], function($){
    var SmartresponderWidget = function () {
    	var _this = this;
		this.callbacks = {
			render: function(){
                var lang = _this.i18n('userLang');
                w_code = _this.get_settings().widget_code; //get widget code

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
                       <div class="sr-form-button sr-sub">SEND</div>\
                       </div>\
                       <div class="ac-already-subs"></div>\
                   <link type="text/css" rel="stylesheet" href="/widgets/'+w_code+'/main.css" >'
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