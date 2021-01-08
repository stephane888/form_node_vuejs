config = {};
(function($) {
  Drupal.behaviors.fieldosm = {
    attach : function(context, settings) {
          // to get datas form modules
          console.log(settings.form_node_vuejs);
          config=settings.form_node_vuejs;
    }
  };
})(jQuery);

//create editor


jQuery(document).ready( function($) {
  
      //
  
      // settings.wbujson.addnode;
      // config.contentType = 'equiepem';
      // check if component is loaded
      function checkComponent() {

        var component_name = [ 'formgenerate' ], isloaded = true;
        $.each(component_name, function(index, value) {
          if (!(value in Vue.options.components)) {
            isloaded = false;
            console.log('template error : '+value);
          }
        });
        //if( window.CKEditor ){}else{isloaded = false; console.log('loading ckeditor') }
        if (isloaded && config.nid) {
          // add ckeditor if it not exists
          //Vue.use( CKEditor );
          var FormGenerate = new Vue({
            delimiters : [ '${', '}' ],
            el : '#FormGenerate',
            data : {
            	template:'editnode',
              waitingload:'true',
              classe:'',
              id:config.nid,
              bundle:config.nid,
              // list relation
              header_relation:'En relation avec ',
              rows_relation:[],
              show_header_relation:false,
              // list info
              header_info:'Parametres',
              rows_info:[],
              show_header_info:true,
              nodes_infos:[],
              editform_title:'',
              //alert message
              attribut_class:'alert-primary',
              message:'Patientez svp, sauvergarde en cours ...',
              show_alert:false,   
              id_html_form: uuidv4(),
              //show waiting boule
              //wainting_boule:'',
              //show_wainting_boule:false,
              //wainting_boule_message:'',
              // show cover
              //classesaved:'',
              //list header_next
              header_next:'Enregistrer et Ajouter :',
              rows_next:[],
              show_header_next:false,
              // redirect page
              redirect:false,
              page_redirect:'',
              execute_saveform:'',
              //node relation
              content_type:'',
              nodes_relation:[],
            },
            mounted : function() {
              
              
            },
            methods:{
              form_parentaction: function(datas){
                console.log('datas in parent')
                console.log(datas);
                if(datas.status){
                  if(datas.step=='form_display'){
                    this.entity_reference(datas.defaultfields, datas.model, datas.settings);
                    //
                    this.content_type=datas.defaultfields.bundle;
                    //this.buildRelationNodes(datas.defaultfields.relationnode[this.content_type], this.content_type);
                  }else if('before_save'==datas.step){
                    this.show_alert=true;
                  }else if('after_save'==datas.step){
                    this.form_have_saved(datas);
                    if(this.redirect && this.page_redirect != ''){
                      this.action_redirect(datas.node);
                    }
                  }
                }else{
                  console.log('error');
                  if('after_save'==datas.step){
                    this.form_have_saved(datas);
                  }
                }
              },
              form_have_saved: function(datas){
                //this.wainting_boule='';
                //this.show_wainting_boule = false;
                //this.classesaved='';
                if(datas.status){
                  this.message = '<i class="fas fa-check mr-4 fa-1x" ></i>Le contenu a été sauvergardé ... ';    
                  this.attribut_class='alert-success';
                }else{
                  var message = '<strong> Echec de la sauvegarde  ... </strong>'; 
                  message +='<p>Message d\'erreur : '+datas.error.statusText+'</p>';
                  this.attribut_class='alert-danger';
                  this.message = message;
                }
                
                
              },
              closeByParent: function(){
                this.show_alert = false;
              },
              entity_reference: function(defaultfields, model, settings){
                var self = this;
                //var defaultfields = params.defaultfields;
                //var fields = params.currentfields;
                /// update title edit form
                this.editform_title = defaultfields.bundles_infos[defaultfields.bundle].label+' : <strong><em>'+defaultfields.fields.title.valeur[0].value+'</em></strong>';
                
                /// display list relation 
                self.nodes_infos=defaultfields.bundles_infos;
                //params=params.currentfield;
                var rows = []; 
                $.each(defaultfields.fields, function(index, value){
                  if(value.settings && value.settings.handler =="default:node"  ){ 
                    var obj = value.settings.handler_settings.target_bundles;
                    var bundle = obj = obj[Object.keys(obj)[0]];
                    if(self.nodes_infos[obj]){obj = self.nodes_infos[obj].label; }
                    var nombre = 0;
                    if((model[index] && model[index].target_ids && model[index].target_ids !="")){
                      if(model[index].target_ids instanceof Array){nombre = 'array';}else{nombre = 1;}
                    }
                    rows.push({
                      html_tag:{
                        tag:'span',
                        value:nombre,
                        classe:'badge badge-info float-right',
                        beforetag:obj,
                        aftertag:'',
                      }
                    });
                  }
                });
                if(rows.length > 0){this.show_header_relation=true;}
                this.rows_relation = rows; //console.log(rows);
                
                /// display parameters
                $.each(settings, function(index, value){ //console.log(value);
                   if(index == 'nid'){
                     //self.rows_info.push('Identifiant : <span class="float-right badge">'+value[0].value+'</span>');
                     self.rows_info.push({
                       html_tag:{
                         tag:'span',
                         value:value[0].value,
                         classe:'badge badge-light float-right',
                         beforetag:'Identifiant',
                         aftertag:'',
                       }
                     });
                   }else if(index == 'created'){
                     //self.rows_info.push('Créer le : <span class="float-right badge">'+value[0].value+'</span>');
                     self.rows_info.push({
                       html_tag:{
                         tag:'span',
                         value:value[0].value,
                         classe:'badge badge-light float-right',
                         beforetag:'Créer le ',
                         aftertag:'',
                         perform:['getDateinFrenchByTimestamp'],
                       }
                     });
                   }else if(index == 'changed'){
                     //self.rows_info.push('Modifié le : <span class="float-right badge">'+value[0].value+'</span>');
                     self.rows_info.push({
                       html_tag:{
                         tag:'span',
                         value:value[0].value,
                         classe:'badge badge-light float-right',
                         beforetag:'Mise à jour ',
                         aftertag:'',
                         perform:['getDateinFrenchByTimestamp'],
                       }
                     });
                   }else if(index == 'uid'){
                     //self.rows_info.push('Modifié le : <span class="float-right badge">'+value[0].value+'</span>');
                     self.rows_info.push({
                       html_tag:{
                         tag:'span',
                         value:value[0].value,
                         classe:'badge badge-light float-right',
                         beforetag:'Auteur ',
                         aftertag:'',
                       }
                     });
                   }
                });
              },
              buildRelationNodes(nodes, content_type){
                var rows = [];
                $.each(nodes.input, function(g,k){
                  if(k.value==1){
                    rows.push({
                      html_tag:{
                        tag:'span',
                        value:null,
                        classe:'badge badge-info float-right',
                        beforetag:' ',
                        aftertag:'<div class="text-right d-block"><span data-content-type="'+k.name+'" title="Ajouter un contenu : '+k.label+'" class="btn btn-sm btn-success">'+k.label+' <i class="fas fa-plus"></i></span> </div>',
                      }
                    });
                  }
                });
                if(rows.length > 0){this.show_header_next=true;}
                this.rows_next = rows; //console.log(rows);
              },
              click_on_list: function(e){
                //console.log(e);
                console.log(e.target);
                if($(e.target).hasClass('btn-success')){
                  var content_type = $(e.target).attr('data-content-type');
                  this.redirect = true;
                  this.page_redirect = '/wbu-json/add/node/'+content_type;
                  this.execute_saveform='saveform';
                }else{
                  console.log('ouside bouton .btn');
                }
                
              },
              action_redirect: function(node){
                var self=this;
                var url=window.location.origin;
                url +=this.page_redirect;
                params={
                  id:node.nid[0].value,
                  bundle:this.content_type,
                  title:node.title[0].value
                };
                url +='?entity-relation='+encodeURIComponent(JSON.stringify(params));                
                console.log(url);
                setTimeout(function(){
                  //alert to redirect
                  self.attribut_class='alert-info';
                  var message = '<h3 > Redirection en cours ... </h3>'
                  self.message = message;
                  location.replace(url);                  
                }, 1000);
              },
            },
            
          });
          // generate uid 
          function uuidv4() {
            return 'id-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          }
          
          
          
          
          
          
          
          
          
          
          
        } else {console.log('wait');
          setTimeout(function() {
            checkComponent();
          }, 3000);
        }
        
      }
      checkComponent();
      // end

});      