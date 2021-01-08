config = {};
(function($) {
  Drupal.behaviors.fieldosm = {
    attach : function(context, settings) {
          // To get datas form modules
          // Console.log(settings.form_node_vuejs);
          config=settings.form_node_vuejs;
    }
  };
})(jQuery);

jQuery(document).ready( function($) {
      // settings.wbujson.addnode;
      // config.contentType = 'equiepem';
      // check if component is loaded
      function checkComponent() {

        var component_name = [ 'formgenerate' ], isloaded = true;
        $.each(component_name, function(index, value) {
          if (!(value in Vue.options.components)) {
            isloaded = false;
            console.log(value);
          }
        });
        if (isloaded && config.contentType) {
          var FormGenerate = new Vue({
            delimiters : [ '${', '}' ],
            el : '#FormGenerate',
            data : {
            	template:'addnode',
              waitingload:'true',
              classe:'',
              bundle:config.contentType,
              // list relation
              header_relation:'En relation avec ',
              rows_relation:[],
              show_header_relation:false,
              // list info
              header_info:'Parametres',
              rows_info:[],
              show_header_info:false,
              nodes_infos:[],
              editform_title:'',
              //alert message
              attribut_class:'alert-primary',
              message:'Patientez svp, sauvergarde en cours ...',
              show_alert:false,   
              id_html_form: uuidv4(),
              // current node
              currentNode:[],
              //  reccent
              header_reccent:'Contenus reccents',
              rows_reccent:[],
              show_header_reccent:false,
              //  node relation
              content_type:config.contentType,
              nodes_relation:[],
              // list header_next
              header_next:'Etape suivante',
              rows_next:[],
              show_header_next:false,
              // redirect page
              redirect:false,
              page_redirect:'',
              execute_saveform:'',              
            },
            mounted : function() {
              
              
            },
            methods:{
              form_parentaction: function(datas){
                //console.log('datas in parent')
                //console.log(datas);
                this.execute_saveform='';
                if(datas.status){
                  if(datas.step=='form_display'){
                    this.entity_reference(datas.defaultfields, datas.model, datas.settings);
                    //datas.model.title.value='text update title';
                    this.manageFormDynamic(datas.model);
                    //if()
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
                  this.execute_saveform='';
                  //console.log('error');
                  if('after_save'==datas.step || 'before_save'==datas.step  ){
                    this.form_have_saved(datas);
                  }
                }
              },
              action_redirect: function(node){
                var self=this;
                var url=window.location.origin;
                url +=this.page_redirect;
                params={
                  id:node.nid[0].value,
                  bundle:this.bundle,
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
              form_have_saved: function(datas){
                var rows = [];
                //this.wainting_boule='';
                //this.show_wainting_boule = false;
                //this.classesaved='';
                if(datas.status){
                  this.message  = '<div class="d-table">'
                  this.message += '<div class="d-table-cell"><i class="fas fa-check mr-4 fa-1x" ></i></div> ';   
                  this.message += '<div class="d-table-cell"> Le contenu a été sauvergardé ... <p><strong>'+datas.node.title[0].value+'</strong></p> </div>';
                  this.message += '</div>';
                  this.attribut_class='alert-success';
                  // display datas have save;                  
                  this.currentNode.push(datas.node);
                  $.each(this.currentNode, function(r,t){
                    rows.push({
                      html_tag:{
                        tag:'span',
                        value:null,
                        classe:'badge badge-info float-right',
                        beforetag:'<a href="/node/'+t.nid[0].value+'" title="Voir le contenu">'+t.title[0].value+'</a>',
                        aftertag:'<a href="/form-node-vuejs/edit/node/'+t.nid[0].value+'" title="Modifier le contenu" class="float-right ml-2 text-primary"><i class="far fa-edit"></i></a>',
                      }
                    });                    
                  });
                  if(rows.length > 0){this.show_header_reccent=true; rows = rows.reverse();}
                  this.rows_reccent = rows;
                }else{
                  if('before_save'==datas.step){this.attribut_class='alert-warning';}else{this.attribut_class='alert-danger';}
                  var message = '<h5 class="mb-3"> Erreur : Les champs du formulaires ne sont pas bien remplis </h5>';                  
                  var error_message = (datas.error.statusText)?datas.error.statusText:datas.error;
                  message +='<div>'+error_message+'</div>';                  
                  if(datas.error.status && datas.error.getResponseHeader('x-csrf-custom-error')){
                	  message ='';
                	  if(datas.error.status == 503){
                		  message += '<h5 class="mb-3"> Service indisponible </h5>'; 
                	  }else{
                		  message += '<h5 class="mb-3">'+ datas.error.status +'</h5>'; 
                	  }                	  
                	  message += '<p>'+datas.error.responseJSON+'</p>';
                  }
                  this.message = message;
                }                
              },
              closeByParent: function(){
                this.show_alert = false;
              },
              entity_reference: function(defaultfields, model, settings){
                var self = this;
                var rows = []; 
                self.nodes_infos=defaultfields.bundles_infos;
                $.each(defaultfields.fields, function(index, value){
                  if(value.settings && value.settings.handler =="default:node"  ){ 
                    var obj = value.settings.handler_settings.target_bundles;
                    var bundle = obj = obj[Object.keys(obj)[0]];
                    if(self.nodes_infos[obj]){obj = self.nodes_infos[obj].label; }
                    /*
                    var nombre = 0;
                    if((model[index] && model[index].target_ids && model[index].target_ids !="")){
                      if(model[index].target_ids instanceof Array){nombre = 'array';}else{nombre = 1;}
                    }*/
                    rows.push({
                      html_tag:{
                        tag:'span',
                        value:null,
                        classe:'badge badge-info float-right',
                        beforetag:obj,
                        aftertag:'<a href="/wbu-json/add/node/'+bundle+'" title="Ajouter un contenu : '+obj+'" class="float-right ml-2 text-primary"><i class="fas fa-plus"></i></a>',
                      }
                    });
                  }
                });
                if(rows.length > 0){this.show_header_relation=true;}
                this.rows_relation = rows; //console.log(rows);
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
                        beforetag:'Enregistrer et Ajouter : ',
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
                //console.log(e.target);
                if($(e.target).hasClass('btn-success')){
                  var content_type = $(e.target).attr('data-content-type');
                  this.redirect = true;
                  this.page_redirect = '/wbu-json/add/node/'+content_type;
                  this.execute_saveform='saveform';
                }else{
                  console.log('ouside bouton .btn');
                }
              },
              manageFormDynamic: function(model){
            	  //console.log(model);
            	  //model.title.value = 'Titre MAJ';
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
        } else {
          setTimeout(function() {
            checkComponent();
          },1500);
        }
        
      }
      checkComponent();
      // end

});      