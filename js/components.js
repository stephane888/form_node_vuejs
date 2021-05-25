/**
 * Pour la rotation d'image.
 * https://stackoverflow.com/questions/20600800/js-client-side-exif-orientation-rotate-and-mirror-jpeg-images
 * https://jsfiddle.net/wunderbart/dtwkfjpg/
 * https://jsfiddle.net/orotemo/obvna6qn/1/
 * 
 * Pour le  traitement d'image ( Rotation, decoupage ... )
 * https://github.com/blueimp/JavaScript-Load-Image
 * @param $
 * @returns
 */
jQuery(document).ready( function($) {
	const typingWait = 800;
	  /**
		 * component formgenerate
		 * **************************************************
		 */
	  var props_formgenerate = {
	      fields:[Object, Array],
	      model0:[Object, Array],      
	      submit:{
	        type: [Object, Array],
	        default: function () {
	            return {label:'enregistre', callback:'ev_saveform', classe:{btn:'btn-outline-success', dafault:''}, show:true, disabled:false,};
	          }
	      },
	      classe:{type:String, default: 'form-builder my-1 row',},
	      field_class:{type:String, default: 'col-sm-12',},
	    };
	  Vue.component('formgenerate', {
	    delimiters: ['${', '}'],
	    template: '#form-template',
	    props: props_formgenerate,    
	    data : function () {
	      return {
	        class_active_button:'',
	        pageReload:true,
	      }
	    },
	    methods:{
	      save_f2: function(){
	        //console.log(' Déclenche le parent Niveau superieur : '+this.submit.callback);
	        this.$emit(this.submit.callback);
	      },
	      saveImage2: function(params){
	        //console.log(' Save image 2 : ', params);
	        this.$emit('ev_saveimage_by_parent', params);
	      },
	      build_class: function(classes){
	        if(classes instanceof Object || classes instanceof Array){
	          var classe='';
	          $.each(classes, function(i,f){
	            classe +=' '+f;
	          });
	          return classe;
	        }else{
	          return classes;
	        }
	      },
	      window_event_listern: function(){
	        // https://stackoverflow.com/questions/36866715/how-to-remove-event-listener/36866859
	        if(!this.pageReload){
	          window.addEventListener('beforeunload', functionToRun)
	            
	        }else if(this.pageReload){
	          console.log('event remove');
	          window.removeEventListener("beforeunload");
	        }  
	      },
	      value_in_field_changed: function(){
	        // console.log('formgenerate: field have change change');
	        // this.submit.disabled=false;
	        // this.submit.classe.btn=this.class_active_button.btn;
	        // this.submit_classe = this.build_class(this.submit.classe);
	        this.pageReload=false;
	        this.window_event_listern();
	      },
	    },
	    mounted : function() {
	      // this.submit.disabled=true; //dissable button save, after form
			// display
	      this.class_active_button=this.submit.classe;
	      // this.submit.classe.btn="btn-outline-dark";
	    },
	    computed: {
	      submit_classe: {
	        get:function(){
	          return this.build_class(this.submit.classe);
	        },
	        set: function(){
	          
	        }
	      },
	    },
	    components: {      
	      'formfield':{        
	        props: {
	          renderfield:[Object, Array],
	          model:[Object, Array],
	          settings:[Object, Array],
	          // type:String,
	        },
	        template: ` <component v-bind:is="template_input" class="form-group" :field="renderfield" :model="model"  @ev_saveimage="saveImage" :label="renderfield.label" :name="model[renderfield.model]" :id_html="build_id_html" @value_have_change="value_in_field_changed"></component>
	        `,
	        created: function() {
	          if(this.renderfield.multiple && this.renderfield.multiple.number){
	            this.$options.template = '<fieldset class="form-group">'+this.$options.template+'</fieldset>';
	          }
	        },
	        methods:{
	          saveImage: function(params){
	            //console.log('save image');
	            this.$emit('ev_saveimage_by_parent', params);
	          },
	          value_in_field_changed: function(){
	            // console.log('value_in_field_changed');
	            // this.$emit('value_have_change');
	          },
	        },
	        computed: {
	          template_input: {
	            get: function (){
	            	var component_name = 'input_' + this.renderfield.type;
	              isComponentExists = component_name in Vue.options.components
	              if(isComponentExists){
	                 //console.log(' Template is define ok : '+component_name);
	                return component_name;
	              }else{
	                console.log(' Template not define Error : '+component_name);
	              }              
	            },
	          },
	          build_id_html: {
	            get: function(){ 
	              return 'edit-'+this.renderfield.model;
	            },
	          },        
	        },
	      },      
	    },    
	    
	  }); 
	
	  // /component formgenerate_node
		// **************************************************
	  /**
		 * to use this function correcly, you have to define the parent method
		 * "@ev_actionparent="form_parentaction" in the parent tags, example
		 * when edit form : <formgenerate_node :bundle="id" action="edit"
		 * 
		 * @ev_actionparent="form_parentaction"></formgenerate_node>
		 */
	  props_formgenerate.bundle={type:String, default: 'acticle',};
	  props_formgenerate.action={type:String, default: 'add',};
	  props_formgenerate.execute_saveform={type:String, default: '',};
	  Vue.component('formgenerate_node',{
	    delimiters: ['${', '}'],
	    props: props_formgenerate, 
	    template: '#form-formgenerate_node',
	    data : function () {
	      return {
	        formdatas : {
	          fields : [],
	          model : {},
	          submit : {
	            label : 'Enregistrer',
	            callback : 'ev_saveform',
	            show:false,
	            classe:{btn:'btn-outline-success', dafault:'float-right mt-4'},
	            disabled:false,
	          },
	          settings : {
	            type : [ {
	              target_id : this.bundle,
	              target_type : "node_type",
	            } ],
	          },
	        },
	        defaultfields:[],
	        editform_title: 'Ajouter un contenu : <strong>'+this.bundle+'<strong>',
	        //
	        show_waiting_multibuoule:false,
	        // cover
	        add_cover:'',
	        // waiting boule bouence
	        show_waiting_boule:false,
	        waiting_boule_message:' Sauvegarde en cours ... ',
	        // alert
	        show_alert:false,
	        alert_message:'',
	        alert_attribut_class:'alert-danger',
	        alert_id_html: 'alert'+this.bundle,
	        // relation_entity
	        entity_relation:{},
	      }
	    },
	    mounted : function() {
	      var self = this;var url = '';
	      // chek if relation is define
	      var t = window.location.search
	      if(t){
	        var params=decodeURIComponent(t);
	        params= params.split('entity-relation=');
	        if(params[1]){
	          this.entity_relation = JSON.parse(params[1]);
	        }
	      }      
	      // self.formdatas.submit.disabled=true; //dissable button to save
	      //console.log('Content type');
	      //console.log(self.bundle);
	      self.show_waiting_multibuoule=true;
	      if(self.action == 'add'){url='/api/form-node/generate-form/'+self.bundle;}
	      else if(self.action == 'edit'){url='/api/form-node/edit-form/'+self.bundle;}
	      $.ajax({
	        url : url,
	        method : 'GET',
	        // async : false,
	        success : function(data) {
	          console.log(data);          
	          self.display_forms(data);
	        },
	        error : function(error) {
	          console.log(error);
	          self.$emit('ev_actionparent', {status:false, step:'form_display', 'error':error});
	          self.show_waiting_multibuoule=false;
	          self.show_alert_error(error.responseJSON);
	        }
	      });
	    },
	    watch: {      
	      execute_saveform: function(){
	        if(this.execute_saveform == 'saveform'){
	          console.log("parent declenche form ");
	          this.saveform();
	        }else{
	          console.log("error parent declenche form ");
	        }
	      }
	    },
	    methods : {
	      display_forms: function(data){
	        var self = this;
	        if(data.error){ 
	          console.log('close');   
	          self.$emit('ev_actionparent', {status:false, step:'form_display'});
	        }else{
	          // put datas .
	          this.defaultfields = data;
	          var fieldsAll = generate_schema_form(data.fields, this.entity_relation);
	          self.formdatas.model = fieldsAll.model;
	          self.formdatas.fields = fieldsAll.fields;
	          if(self.action == 'add'){
	            //console.log('datas in modal');
	            //console.log(self.defaultfields);
	            var titre = (self.defaultfields.node && self.defaultfields.node.label)?self.defaultfields.node.label:data.bundles_infos[self.bundle].label;
	            titre = '<em>'+ titre +'</em>';
	            //
	            if(this.entity_relation && this.entity_relation.id){
	              titre +=', <span class="text-info" >lié au contenu <strong>'+this.entity_relation.bundle+'</strong> : <em>'+this.entity_relation.title+'</em></span>' 
	            }
	            self.editform_title = '<span><strong> Ajouter un contenu </strong> : '+titre+'</span>';
	          }else if(self.action == 'edit'){
	            self.formdatas.settings.type=[
	              {target_id:data.bundle}
	            ];
	            self.formdatas.settings={
	                type:self.formdatas.settings.type,
	                nid:data.fields.nid.valeur,
	                uuid:data.fields.uuid.valeur,
	                _links:{ 'type':{ 'href': window.location.origin+'/rest/type/node/'+data.bundle } },
	                bundle:data.bundle,
	                changed:data.fields.changed.valeur,
	                created:data.fields.created.valeur,
	                uid:data.fields.uid.valeur,
	                
	            }
	            var titre = (data.fields && data.fields.title.valeur)? data.fields.title.valeur[0].value:'';
	            
	            self.editform_title = '<span><strong>'+data.bundles_infos[data.bundle].label +'</strong> : <em>'+ titre +'</em></span>';
	          }
	          self.$emit('ev_actionparent', {settings:self.formdatas.settings, 'model':self.formdatas.model, 'defaultfields':this.defaultfields, status:true, step:'form_display',});
	          self.formdatas.submit.show=true;
	        }
	      self.show_waiting_multibuoule=false;
	      },
	      rebuild_partiel_display_form: function(data){
	        var self = this; 
	        // rebuid title
	        if(this.action == 'edit'){
	          var bundle_info='',  titre = (data.title && data.title[0])? data.title[0].value:'';
	          if(this.formdatas.settings.bundle){
	            bundle_info = this.formdatas.settings.bundle;
	          }else if(this.defaultfields.node && this.defaultfields.node.label){bundle_info = this.defaultfields.node.label;}        
	          this.editform_title = '<span><strong>'+ bundle_info +'</strong> : <em>'+ titre +'</em></span>';
	          // Rebuild datas to send to parent
	          
	          
	        }else if(this.action == 'add'){
	          var fieldsAll = generate_schema_form(this.defaultfields.fields);
	          self.formdatas.model=[];
	          self.formdatas.fields=[];
	          setTimeout(function(){
		          self.formdatas.model = fieldsAll.model;
		          self.formdatas.fields = fieldsAll.fields;
		          window.removeEventListener("beforeunload", functionToRun);
	          }, 600);
	        }
	        
	        
	      },
	      saveform : function() {
	        var self = this; 
	        // self.formdatas.submit.disabled=true;
	        //console.log('Custom methode : saveform | update ');
	        self.add_cover='cover';   
	        self.show_waiting_boule=true;
	        var newNode = buildNode(this.formdatas, this.action, self.defaultfields);
	        self.$emit('ev_actionparent', {status:true, step:'before_save', 'node':newNode});
	        if(newNode.error){
	          //console.log(newNode);
	          self.add_cover='';
	          self.show_waiting_boule=false;
	          var html = '<ul>';
	          $.each(newNode.fields, function(i, field){
	        	  $('#edit-'+field.field).addClass('is-invalid');
	        	  $('label[for="edit-'+field.field+'"]').addClass('text-danger');
	        	  html += '<li>';
	        	  html += field.infos;
	        	  html += '</li>';
	          });
	          html += '</ul>';
	          self.$emit('ev_actionparent', {status:false, step:'before_save', 'error':html});
	          /**
	           * scroll to Top
	           */
	          self.scrollToTop();
	        }
	        else if(this.action == 'add' ){      
	          getCsrfToken(function(csrfToken) {
	            //console.log('Before save Node')
	            /**
	             * use custom method to POST data.
	             * '/api/form-node/create/node'
	             */
	            self.postEntity(csrfToken, newNode, '/api/form-node/create/node'); 
	          });
	          /**
	           * scroll to Top
	           */
	          self.scrollToTop();
	        }
	        else if(this.action == 'edit'){          
	          getCsrfToken(function(csrfToken) {
	            console.log('Before update Node')
	            console.log(newNode);
	            self.patchEntity(csrfToken, newNode, url='/node/'+self.formdatas.settings.nid[0].value+'?_format=json');
	          });
	          /**
	           * scroll to Top
	           */
	          self.scrollToTop();
	        }/**/
	        
	      },
	      postEntity: function(csrfToken, entity, url='/node?_format=json') {
	        var self = this;
	        //console.log(entity);
	        var datas;
	        var headers = {
	          'Content-Type': 'application/json',
	          'X-CSRF-Token': csrfToken, 
	        };
	        datas = JSON.stringify(entity);
	        jQuery.ajax({
	          url: url,
	          method: 'POST',
	          headers: headers,
	          data: datas,
	          success: function (data) {
	            self.afterSave(data);
	            //console.log(data);
	          },
	          error: function (error) { console.log('false');
	            console.log(error);
	            self.$emit('ev_actionparent', {status:false, step:'after_save', 'error':error});
	            self.add_cover='';
	            self.show_waiting_boule=false;
	          }
	        });
	      },
	      patchEntity: function(csrfToken, entity, url='/node?_format=json') {
	        var self = this;
	        console.log(url);
	        var datas;
	        var headers = {
	          'Content-Type': 'application/json',
	          'X-CSRF-Token': csrfToken, 
	        };
	        datas = JSON.stringify(entity);
	        jQuery.ajax({
	          url: url,
	          method: 'PATCH',
	          headers: headers,
	          data: datas,
	          success: function (data) {
	            self.afterSave(data);
	            console.log(data);
	          },
	          error: function (error) {
	            console.log(error);
	            self.$emit('ev_actionparent', {status:false, step:'after_save', 'error':error});
	            self.add_cover='';
	            self.show_waiting_boule=false;
	          }
	        });
	      },
	      afterSave: function(data){
	        var self=this;
	        window.removeEventListener("beforeunload", functionToRun);
	        this.add_cover='';
	        this.show_waiting_boule=false;
	        this.$emit('ev_actionparent', {status:true, step:'after_save', 'node':data}); 
	        // alert
	        this.show_alert_message();       
	        //
	        this.rebuild_partiel_display_form(data);
	      },
	      saveImage: function(params){
	    	  //console.log('enfin img ', params);
	    	  var self = this;
	    	  if(params.length > 0){
	    		  //const promise = self.control_SendImageIndrupal(params);
	    		  control_SendImageIndrupal(params).then(PromiseSuccessCallback, PromiseFailureCallback);
	    	  }
	    	  /**
	    	   * 
	    	   */
	    	  function PromiseSuccessCallback(vals){
	    		  //console.log('datas : ', vals);
	    		  var datas = vals.datas;
	    		  var etape = vals.etape;
	    		  var field = vals.field;
	    		  var key_image = vals.key_image;
	    		  self.formdatas.model[field].target_ids.push({target_id:datas.fid[0].value, alt:''});
	    		  self.formdatas.model[field].image_data[key_image]['progress_value']=100;
	    		  self.formdatas.model[field].image_data[key_image]['is_susses_progress']=true;
	    		  self.formdatas.model[field].image_data[key_image]['is_perform_progress']=false;
		          //console.log(self.formdatas.model);
		          self.formdatas.model[vals.field].percent=100;
		          if((etape + 1) < params.length){
		        	  control_SendImageIndrupal(params, (vals.etape + 1)).then(PromiseSuccessCallback, PromiseFailureCallback);
		          }
	    	  }
	    	  /**
	    	   * 
	    	   */
	    	  function PromiseFailureCallback(vals){
	    		  var datas = vals.datas;
	    		  var etape = vals.etape;
	    		  var field = vals.field;
	    		  var key_image = vals.key_image;
	    		  self.formdatas.model[field].image_data[key_image]['progress_value']=100;
	    		  self.formdatas.model[field].image_data[key_image]['is_susses_progress']=false;
	    		  self.formdatas.model[field].image_data[key_image]['is_perform_progress']=false;
	    		  self.formdatas.model[field].image_data[key_image]['has_error_progress']=true;
	    		  self.formdatas.model[field].image_data[key_image]['message']=errorAnalysisDrupal(vals.error);
	    		  if((vals.etape + 1) < params.length){
	    			  control_SendImageIndrupal(params, (vals.etape + 1)).then(PromiseSuccessCallback, PromiseFailureCallback);
		          }
	    	  }
	    	  /**
	    	   * 
	    	   */
	    	  function control_SendImageIndrupal(files, etape=0){
		    	  var param = files[etape], file=param.file, field = param.name, bundle='', entity_type_id='node', key_image=(param.key_image - 1);
		    	  //console.log(' Save image Promise , ETAPE : ', etape);
		    	  return new Promise((resolve, reject) => {
		    		  
		    		  self.formdatas.model[field]['image_data'][key_image]['progress_value']=5;
		    		  self.formdatas.model[field].image_data[key_image]['is_perform_progress']=true;
		    		  /**
		    		   * 
		    		   */
		    		  if(!param.send_image){
		    			  //console.log(param);
		    			  error = param.message;
		    			  reject({error:error, etape:etape, field:field, key_image:key_image});
		    			  return false;
		    		  }
		    		  //
				        self.formdatas.model[param.name].percent=5;
				        self.formdatas.model[param.name].index_image=params.key_image;
				        self.formdatas.model[param.name].status=true;
				        
				        var filename = (file.name).replace(/[^a-zA-Z0-9.]/g,'-');
				        filename = filename.toLowerCase();
				        if(self.formdatas.settings.type[0].target_type == 'node_type'){
				          entity_type_id = 'node';
				        }
				        var formData = new FormData();
				        formData.append('data', file);
				        if(self.formdatas.settings.type[0].target_id){bundle=self.formdatas.settings.type[0].target_id;}  
				        
				          getCsrfToken(function (csrfToken) {                
				            var url = '/file/upload/'+entity_type_id+'/'+bundle+'/'+field+'?_format=json';
				            //console.log(url);				            
				            $.ajax({
				              type: 'POST',
				              url: url,
				              data: file,
				              contentType: false,
				              cache: false,
				              processData:false,
				              beforeSend: function(xhr){
				                xhr.setRequestHeader('X-CSRF-Token', csrfToken);
				                xhr.setRequestHeader('Content-Disposition', 'file; filename="'+filename+'"');
				                xhr.setRequestHeader('Content-Type', 'application/octet-stream');
				              },
				              success: function(datas){
				            	  resolve({datas:datas, etape:etape, field:field, key_image:key_image});
				                //presave_image_fid(datas);
				              },
				              error: function (error) { 
				            	  console.log(error);
				            	  reject({error:error, etape:etape, field:field, key_image:key_image});
				              }
				          });
				        });
		    	  });
		      };
	      },	      
	      sendImageIndrupal: function(file){
		        var self = this;
		        self.formdatas.model[params.name].percent=5;
		        self.formdatas.model[params.name].index_image=params.key_image;
		        self.formdatas.model[params.name].status=true;
		        /*
		        */
		        //console.log(' Save image ');
		        //console.log(file);
		        var entity_type_id = 'node'; var bundle = field ='';
		        var filename = (file.name).replace(/[^a-zA-Z0-9.]/g,'-');
		        filename = filename.toLowerCase();
		        field = params.name;
		        if(this.formdatas.settings.type[0].target_type == 'node_type'){
		          entity_type_id = 'node';
		        }
		        var formData = new FormData();
		        formData.append('data', file);
		        if(this.formdatas.settings.type[0].target_id){bundle=this.formdatas.settings.type[0].target_id;}  
		          getCsrfToken(function (csrfToken) {                
		            var url = '/file/upload/'+entity_type_id+'/'+bundle+'/'+field+'?_format=json';
		            //console.log(url);
		            $.ajax({
		              type: 'POST',
		              url: url,
		              data: file,
		              contentType: false,
		              cache: false,
		              processData:false,
		              beforeSend: function(xhr){
		                xhr.setRequestHeader('X-CSRF-Token', csrfToken);
		                xhr.setRequestHeader('Content-Disposition', 'file; filename="'+filename+'"');
		                xhr.setRequestHeader('Content-Type', 'application/octet-stream');
		              },
		              success: function(datas){
		                //console.log(datas);
		                presave_image_fid(datas);
		              },
		              error: function (error) { console.log('false'); 
		                console.log(error);
		                self.formdatas.model[params.name].percent=100;
		                self.formdatas.model[params.name].status=false;
		              }
		          });
		        });
		        function presave_image_fid(datas){
		          //console.log('image haved save succes, and retuen fid ');
		          //console.log(self.formdatas.model[params.name].target_ids);
		          self.formdatas.model[params.name].target_ids.push({target_id:datas.fid[0].value, alt:''});
		          //console.log(self.formdatas.model);
		          self.formdatas.model[params.name].percent=100;
		        }
	      },
	      alertcloseByParent: function(){
	        this.show_alert=false;
	      },
	      show_alert_error: function(message){
	    	  return false;
	    	  var self=this;
	    	  self.show_alert=true;
	          self.alert_message=message;
	          self.alert_attribut_class='alert-warning';  
	      },
	      show_alert_message: function(msg='Données sauvergardées', classe='alert-success'){
		    	return false;
		    	self.show_alert=msg;
		        self.alert_message='';
		        self.alert_attribut_class=classe; 
		  },
		  scrollToTop: function(){
		    	$("html, body").animate({ scrollTop: 0 }, "slow");	
		  }
	    },	    
	    beforeUpdate (){
	      // console.log('formgenerate_node : save node change');
	      // console.log(this.formdatas.model);
	    },
	  });
	  
	  // /component alert message
		// **************************************************
	  Vue.component('alert',{
	    delimiters: ['${', '}'],
	    props: {
	      alert_message:{type: String,default: "alert primary"},
	      alert_id_html:{type: String,default: "id-alert"},
	      show_alert:{type: Boolean,default: true,},
	      alert_attribut_class:{type: String,default: "alert-primary"},   
	    },
	    template: '#template-alert',
	    data : function () {
	      return {
	        // name:'',
	      }
	    }, 
	    computed: {
	      class_alert: {
	        get: function(){
	          var classe='alert alert-dismissible fade show';
	          classe +=' '+this.alert_attribut_class;
	          return classe;
	        },
	      }
	    },
	    methods:{
	      closeByParent: function(){
	        this.$emit('ev_alert_close');
	      }
	    },
	  });
	  
	  // /component input_text
		// **************************************************
	  Vue.component('waitingload_multibuoule',{
	    delimiters: ['${', '}'],
	    props: {
	      show_waiting_multibuoule:{type: Boolean,default: false,},  
	    },
	    template: '#template-waitingload',    
	  });
	  
	  // // component template-progress
		// **************************************************
	  Vue.component('wbu_progress',{
	    delimiters: ['${', '}'],
	    props: {
	      show_progress:{type: Boolean,default: false,},
	      is_perform_progress:{type: Boolean,default: false,},
	      has_error_progress:{type: Boolean,default: false,},
	      is_susses_progress:{type: Boolean,default: false,},
	      progress_value:{type: Number,default: 0,},
	    },
	    template: '#template-progress',    
	  });
	  
	  // / template-waitingboule
	  Vue.component('waitingboule',{
	    delimiters: ['${', '}'],
	    props: {
	      show_waiting_boule:{type: Boolean,default: false,},
	      text:{type: String,default: "LOADING ..."},
	    },
	    template: '#template-waitingboule',
	    data : function () {
	      return {
	      }
	    },
	  });
	  /**
	   * list-group
	   */
	  Vue.component('list_group',{
	    delimiters: ['${', '}'],
	    props: {
	      header:{type: String,default: ""},
	      show_header:{type: Boolean,default: true,},
	      rows:[Object, Array], 
	      index:[Object, Array],
	      classe:{type: String,default: "mb-4"},
	    },
	    template: '#template-list-group',
	    data : function () {
	      return {
	        show_badge:false,
	      }
	    },
	    methods:{
	      valeur_badge:function(index){ 
	        if(index.html_tag ){ 
	          if(index.html_tag.perform){
	            return performedALL(index.html_tag.value, index.html_tag.perform);
	          }else{
	            return index.html_tag.value;
	          }          
	        }
	        return '';
	      },
	      click_on_list_2: function(e){
	        console.log('parent return click ');
	        this.$emit('ev_click_on_list', e);
	      }
	    },
	    components: {      
	      'list':{
	        delimiters: ['${', '}'],
	        props: {
	          datas:[Object, Array, String],
	          valeur_badge:{type: [String, Number],default: ""},
	        },
	        template:' <li @click="click_on_list" > <span v-html="valeurBefore()"></span> <span :class="classe" v-if="show_badge(valeur_badge)" v-html="valeur_badge"></span> <span v-html="valeurAfter()" ></span> </li> ',        
	        methods:{
	          show_badge:function(valeur_badge){ 
	            if(valeur_badge=="" && valeur_badge !=0){return false;}
	            return true;
	          },
	          valeurBefore:function(){
	            if(this.datas.label){return this.datas.label;}
	            else if(this.datas.html_tag && this.datas.html_tag.beforetag){return this.datas.html_tag.beforetag;} 
	            else if(this.datas !=""){return this.datas;}
	            return '';
	          },
	          valeurAfter:function(){
	            if(this.datas.html_tag && this.datas.html_tag.aftertag){return this.datas.html_tag.aftertag;} 
	            return '';
	          },
	          click_on_list: function(e){
	            console.log('emit @ev_click_on_list="click_on_list_2" ')
	            this.$emit('ev_click_on_list', e);
	          }
	          
	        },
	        computed: {
	          classe: {
	            get:function(){
	              if(this.datas.html_tag && this.datas.html_tag.classe){return this.datas.html_tag.classe;} return '';
	            },
	          },
	        },
	      }
	    },
	  });
	  /**
	   * 
	   */
	  Vue.component('input_boolean_radio',{
	    delimiters: ['${', '}'],
	    props: {
	      field:[Object, Array],
	      model:[Object, Array],
	    },
	    template: '#form-template-input-radio',
	    data : function () {
	      return {
	        name: this.field.model,
	        value_on : 1,
	        value_off : 0,
	      }
	    },
	    
	    computed: {
	      id_html: {
	        get: function (){
	          //console.log(this.field);
	          return 'edit-'+this.field.model
	        }
	      },
	      id_html_off:{
	        get: function (){
	          //console.log(this.field);
	          return 'edit-off-'+this.field.model
	        }
	      },
	    },
	    beforeUpdate (){
	      //this.$emit('value_have_change');
	    },
	  });	
	  /**
	   * 
	   */
	  Vue.component('input_boolean_boolean_checkbox',{
	    delimiters: ['${', '}'],
	    props: {
	      field:[Object, Array],
	      model:[Object, Array],
	    },
	    template: '#form-template-input-radio',
	    data : function () {
	      return {
	        name: this.field.model,
	        value_on : 1,
	        value_off : 0,
	      }
	    },
	    
	    computed: {
	      id_html: {
	        get: function (){
	          //console.log(this.field);
	          return 'edit-'+this.field.model
	        }
	      },
	      id_html_off:{
	        get: function (){
	          //console.log(this.field);
	          return 'edit-off-'+this.field.model
	        }
	      },
	    },
	    beforeUpdate (){
	      //this.$emit('value_have_change');
	    },
	  });
	  /**
	   * 
	   */	  
	  Vue.component('input_boolean_options_buttons',{
	    delimiters: ['${', '}'],
	    props: {
	      field:[Object, Array],
	      model:[Object, Array],
	    },
	    template: '#form-template-input-radio',
	    data : function () {
	      return {
	        name: this.field.model,
	        value_on : 1,
	        value_off : 0,
	      }
	    },
	    
	    computed: {
	      id_html: {
	        get: function (){
	          //console.log(this.field);
	          return 'edit-'+this.field.model
	        }
	      },
	      id_html_off:{
	        get: function (){
	          //console.log(this.field);
	          return 'edit-off-'+this.field.model
	        }
	      },
	    },
	    beforeUpdate (){
	      //this.$emit('value_have_change');
	    },
	  });
	  /**
	   * input type radios
	   */	  
	  Vue.component('input_entity_reference_options_buttons',{
	    delimiters: ['${', '}'],
	    props: {
	      field:[Object, Array],
	      model:[Object, Array],
	    },
	    template: '#form-template-input-radios',
	    data : function () {
	      return {
	        name: this.field.model,
	        value_on : 1,
	        value_off : 0,
	        valeur:null,
	      }
	    },
	    mounted: function(){
	    	//console.log(this.model[this.field.model]);
	    	// set value
	    	if(this.model[this.field.model].value){
	    		if(this.model[this.field.model].value.length>0){
	    			this.valeur = this.model[this.field.model].value[0]['target_id'];
	    		}else{
	    			this.valeur = this.model[this.field.model].value;
	    		}
	    		
	    	}	    	
	    },
	    watch: {
	    	valeur: function(){
	    		//console.log(this.valeur);
	    		//console.log(this.model[this.field.model]);
	    		if(this.valeur){
	    			var val = {'target_id':this.valeur};
		    		this.model[this.field.model].value = [val];
	    		}	    		
	    	}
	    },
	    methods: {
	    	validation_radios: function(event){
	    		var self=this;
	    		self.validate_value(event);
	    	},
	    	validate_value: function(event=null){
	    		if(!event){
	    			event = this.currentTag;
	    		}		    		
	    		/**
	    		 * Check if field is required
	    		 */
	    		//console.log(this.field, this.name)
	    		if(this.field.require){
    				$('label[for="edit-'+this.name+'"]').removeClass('text-danger');
	    		}
	    	}
	    },
	    computed: {
	      id_html: {
	        get: function (){
	          //console.log(this.field);
	          return 'edit-'+this.field.model
	        }
	      },
	      id_html_off:{
	        get: function (){
	          //console.log(this.field);
	          return 'edit-off-'+this.field.model
	        }
	      },
	    },
	    beforeUpdate (){
	      //this.$emit('value_have_change');
	    },
	  });
	  /**
	   * 
	   */
	  Vue.component('input_autocomplete',{
		    delimiters: ['${', '}'],
		    props: {
		      field:[Object, Array],
		      model:[Object, Array],
		    },
		    template: '#form-template-input-autocomplete',
		    data : function () {
		      return {
		        id_html : 'edit-'+this.field.model,
		        typingTimer:null,
		        availableTags:[],
		      }
		    },
		    mounted: function(){
		      var self = this; 
		      var obj = this.field.settings.handler_settings.target_bundles, timeout = 2000;
		      obj = obj[Object.keys(obj)[0]];
		      $('#edit-'+this.field.model).autocomplete({
		        source: function(request, response) {
		          var tags = [];
		          
		          if(request!=""){
		              $('#'+self.id_html).addClass('is-invalid');
		              $(' i[data-spin="'+self.id_html+'"]').addClass('fa-spin text-primary');
		              var headers = {
		  	                'Content-Type': 'application/json',
		  	                'X-CSRF-research': request.term,
		  	                'Accept': 'application/json',
		  	              };
		              var vocabulaire_name = obj;
		              var url = '/api/form-node/filter-taxonomy-term/'+vocabulaire_name;
		              $.ajax({
		                url: url,//'/api/custom/taxonomy_term/'+obj+'/listes/'+request.term,
		                method: 'GET',
		                headers: headers,
		                success: function (data) { console.log(data);
		                  
		                  $.each(data, function(index, value){
		                    tags.push({
		                      label: value,
		                      value: index,
		                  });
		                  });
		                  $(' i[data-spin="'+self.id_html+'"]').removeClass('fa-spin text-primary');
		                  response(tags);
		                },
		                error: function (error) { console.log(error);}
		              });
		          }else{response(tags); }
		        },
		        delay: 600,
		        select: function( event, ui ) {
		          event.preventDefault();
		          //apply a label ( default is value)
		          $('#edit-'+self.field.model).val(ui.item.label);
		          //self.model[self.field.model].target_ids = [];
		          var val={'target_id':ui.item.value}
		          self.model[self.field.model].value = [val];
		          self.model[self.field.model].label_term = ui.item.label;
		          $('#'+self.id_html).removeClass('is-invalid');
		          console.log(' After update taxasomy term ');
		          console.log(self.model);
		        },
		        focus: function(event, ui) {
		          event.preventDefault();
		          $('#edit-'+self.field.model).val(ui.item.label);
		        }
		      });
		      
		    },
		    methods:{
		      autocomplete_function:function(event){
		        var search = $('#'+this.id_html).val();
		        if(search==""){
		          $('#'+this.id_html).removeClass('is-invalid');
		        }
		      },
		    },
		    beforeUpdate (){
		      //this.$emit('value_have_change');
		    },
	 });
	  /**
	   * 
	   */
	  Vue.component('input_entity_reference_entity_reference_autocomplete',{
		    delimiters: ['${', '}'],
		    props: {
		      field:[Object, Array],
		      model:[Object, Array],
		    },
		    template: '#form-template-input-autocomplete',
		    data : function () {
		      return {
		        id_html : 'edit-'+this.field.model,
		        typingTimer:null,
		        availableTags:[],		       
		      }
		    },
		    mounted: function(){
		      var self = this; 
		      var obj = this.field.settings.handler_settings.target_bundles, timeout = 2000;
		      obj = obj[Object.keys(obj)[0]];
		      $('#edit-'+this.field.model).autocomplete({
		        source: function(request, response) {
		          var tags = [];
		          
		          if(request!=""){
		              $('#'+self.id_html).addClass('is-invalid');
		              $('label[for="'+self.id_html+'"]').addClass('text-danger');
		              $(' i[data-spin="'+self.id_html+'"]').addClass('fa-spin text-primary');
		              //console.log('label[for="'+self.id_html+'"]');
		              var headers = {
		  	                'Content-Type': 'application/json',
		  	                'X-CSRF-research': request.term,
		  	                'Accept': 'application/json',
		  	              };
		              var vocabulaire_name = obj;
		              var url = '/api/form-node/filter-taxonomy-term/'+vocabulaire_name;
		              $.ajax({
		                url: url,//'/api/custom/taxonomy_term/'+obj+'/listes/'+request.term,
		                method: 'GET',
		                headers: headers,
		                success: function (data) { //console.log(data);
		                  
		                  $.each(data, function(index, value){
		                    tags.push({
		                      label: value,
		                      value: index,
		                  });
		                  });
		                  $(' i[data-spin="'+self.id_html+'"]').removeClass('fa-spin text-primary');
		                  response(tags);
		                },
		                error: function (error) { //console.log(error);
		                }
		              });
		          }else{response(tags); }
		        },
		        delay: 600,
		        select: function( event, ui ) {
		          event.preventDefault();
		          //apply a label ( default is value)
		          $('#edit-'+self.field.model).val(ui.item.label);
		          //self.model[self.field.model].target_ids = [];
		          var val={'target_id':ui.item.value}
		          self.model[self.field.model].value = [val];
		          self.model[self.field.model].label_term = ui.item.label;
		          $('#'+self.id_html).removeClass('is-invalid');
		          $('label[for="'+self.id_html+'"]').removeClass('text-danger');
		          //console.log(' After update taxasomy term ');
		          //console.log(self.model);
		        },
		        focus: function(event, ui) {
		          event.preventDefault();
		          $('#edit-'+self.field.model).val(ui.item.label);
		        }
		      });		      
		    },		    
		    methods:{
		      autocomplete_function:function(event){
		        var search = $('#'+this.id_html).val();
		        if(search==""){
		          $('#'+this.id_html).removeClass('is-invalid');
		          $('label[for="'+this.id_html+'"]').removeClass('text-danger');
		        }
		      },
		    },
		    beforeUpdate (){
		      //this.$emit('value_have_change');
		    },
	 });
	  
	 Vue.component('input_entity_reference_entity_autocomplete_popup',{
		    delimiters: ['${', '}'],
		    props: {
		      field:[Object, Array],
		      model:[Object, Array],
		    },
		    template: '#form-template-input-autocomplete-popup',
		    data : function () {
		      return {
		      	/**
		      	 * Ajax config
		      	 */
		      	open_url_get:'',
		      	open_post_loading:0,//change the value to allow loading
		      	open_get_loading:0,//change the value to allow loading
		      	open_post_datas:{},
		      	open_headers:{},
		      	/**
		      	 * 
		      	 */
		        id_html : 'edit-'+this.field.model,
		        typingTimer:null,
		        availableTags:[],
		        search:'',
		        vocabulaire_name:'',
		        url:'',
		        terms:[],
		        empty_message:false,
		        headers:{},
		        /**
		         * For typing wait
		         */
		        doneTypingInterval:typingWait,
		        typingTimer:null,
		        
		        create_term:'none',
		        villes:[],
		        ville_select:'',
		        textselect: 'Selectionner le terme',
		        modal_title: 'Recherchez et selectionnez',
		        list_hierachique_terms: [],
		        
		      }
		    },
		    mounted: function(){
		    	var self = this; 
		    	/**
	    		 * Check valide data.
	    		 */
	    		$('#'+this.id_html+'modal').on('hide.bs.modal', function (e) {
	    			  if(self.model[self.field.model].label_term =='' || self.model[self.field.model].value.length == 0){
	    				  self.set_validation(false);
	    			  }else{
	    				  self.set_validation();
	    			  }
	    		});
			    var obj = this.field.settings.handler_settings.target_bundles, timeout = 2000;
			    self.vocabulaire_name = obj[Object.keys(obj)[0]];
			    this.open_url_get = '/api/form-node/filter-taxonomy-term-popup/'+self.vocabulaire_name;			    
			    var terms = Cookies.get('form_node_vuejs__terms');
			    if(terms){
			    	self.terms = JSON.parse(terms);
			    }else{
			    	setTimeout(self.get_terms, 1000);
			    }
			    if(this.field.custom_settings ){
			    	this.textselect = this.field.custom_settings.textselect;
			    	this.modal_title = this.field.custom_settings.title;
			    }
			    /**
			     * 
			     */
			    //this.add_select_terms();
			   
		    },
		    methods:{
		    	openmodalsearch : function(event){
		    		this.add_select_terms();
		    	},
		    	add_select_terms: function(parent_tid=0, niveau=0){
		    		var self = this;
		    		var add_term = true;
		    		$.each(this.list_hierachique_terms, function(i,value){
		    			if(value.parent == parent_tid){
		    				add_term=false;
		    			}
		    		});
		    		var an_value_select=[];
		    		if(add_term){
		    			$.each(this.list_hierachique_terms, function(i, val){
		    				if(i <= niveau){
		    					an_value_select.push(val);
		    				}
		    			});
		    			this.list_hierachique_terms=an_value_select;
		    			setTimeout(function(){
  		    			var terms={parent:parent_tid, headers_select2:{'X-CSRF-parent-target-id':parent_tid}}		    			
  		    			self.list_hierachique_terms.push(terms);
		    			},600);
		    		}
		    		console.log(this.list_hierachique_terms);
		    	},
		    	autocomplete_function: function(){
		    		var self = this;
		    		self.empty_message=false;		    		
		    		//$(' i[data-spin="'+self.id_html+'"]').addClass('fa-spin text-primary');
		    		clearTimeout(self.typingTimer);
		    		
		    			self.typingTimer = setTimeout(function(){
		    				self.headers={};
		    				self.create_term='open';
		    				self.get_terms();
		    			}, 800);
		    	},
		    	get_terms: function(){		    		
		    		var self = this;		    		
		    		console.log('find term like : ', self.search);
		    		this.open_headers = {
		  	                'Content-Type': 'application/json',
		  	                'X-CSRF-research': self.search,
		  	                'Accept': 'application/json',
		  	              };
		    		this.open_get_loading=this.open_get_loading+1;
		    		//console.log(headers);
		    		/**
		    		 * 
		    		 *
		              $.ajax({
		                url: self.url,//'/api/custom/taxonomy_term/'+obj+'/listes/'+request.term,
		                method: 'GET',
		                headers: headers,
		                success: function (data) { 
		                  console.log(data);
		                  if(self.create_term == 'open_all'){
		                	  self.villes = data;
		                  }else{
		                	  self.terms = data;
		                	  if(data.length == 0){
			                	  self.empty_message=true;
			                  }else{
			                	  self.save_cookies();
			                  } 
		                  }		                  
		                  $(' i[data-spin="'+self.id_html+'"]').removeClass('fa-spin text-primary');		                  		                  
		                },
		                error: function (error) { 
		                	console.log(error);
		                }
		              });
		              */
		    	},
		    	select_term: function(e){
		    		var self = this;
		    		e.preventDefault();
		    		var term_id = $(e.target).attr('data-term-id');
		    		console.log(term_id);
		    		var val={'target_id':term_id}
			        self.model[self.field.model].value = [val];
		    		self.model[self.field.model].label_term = $(e.target).text();
		    		self.close_popup();
		    	},
		    	open_create_terms: function(e){
		    		e.preventDefault();
		    		var self = this;
		    		if(this.create_term=='open'){
		    			this.create_term = 'open_all';
		    			self.get_terms();
		    		}else{
		    			this.create_term = 'open';
		    		}
		    	},		    	
		    	close_popup: function(){  
		    		$('#'+this.id_html+'modal').modal('hide');
		    	},
		    	save_cookies: function(){
		    		var self = this;
		    		Cookies.set('form_node_vuejs__terms', JSON.stringify(self.terms));
		    	},
		    	set_validation: function(statue=true){
		    		if(statue){
		    			$('#'+this.id_html).removeClass('is-invalid');
				        $('label[for="'+this.id_html+'"]').removeClass('text-danger');
		    		}else{
		    			$('#'+this.id_html).addClass('is-invalid');
				        $('label[for="'+this.id_html+'"]').addClass('text-danger');
		    		}
		    	},
		    	post_datas: function(csrfToken, datas){		    		
		    		var self = this;		    		
		    		var headers = {
		  	                'Content-Type': 'application/json',
		  	                'Accept': 'application/json',
		  	                'X-CSRF-Token': csrfToken,
		  	              };
		    		headers = $.extend({}, headers, self.headers);	
		    		datas = JSON.stringify(datas);
		              $.ajax({
		                url: '/api/form-node/create/node',//'/api/custom/taxonomy_term/'+obj+'/listes/'+request.term,
		                method: 'POST',
		                headers: headers,
		                data: datas,
		                success: function (data) { 
		                  console.log(data);		                  		                  
		                },
		                error: function (error) { 
		                	console.log(error);
		                }
		              });
		    	},
		    	select_from_sub_select: function(index, datas){
		    		console.log(index);
		    		var self=this;
		    		console.log('select niveau n', datas);
		    		var val={'target_id':datas.tid}
		        self.model[self.field.model].value = [val];
		    		self.model[self.field.model].label_term = datas.name;
		    		if(datas.action =='add_new_term'){
		    			
		    		}
		    		/**
		    		 * 
		    		 */
		    		
		    		this.add_select_terms(parseInt(datas.tid), index);
		    	},
		    	open_data_from_ajax: function(datas){
		    		console.log(datas);
		    		if(datas.status){
		    			if( (datas.url).indexOf('/api/form-node/filter-taxonomy-term-popup/)' >= 0 ) ){
		    				this.terms = datas.data;
		    				if(datas.data.length == 0){
              	  this.empty_message=true;
                }else{
              	  this.save_cookies();
                }
		    			}
		    		}
		    	}
			},
	 });	  
	 
	 Vue.component('input_entity_reference_select2',{
		 delimiters: ['${', '}'],
		 props: {
		      field:[Object, Array],
		      model:[Object, Array],
		      id_html:{type: String,default: "edit-select2"},
		      parent_tid:[Number],
		      headers:[Object],
		 },
		 template: '#form-template-input_select2',
		 data : function () {
		      return {
		      	name:'',
		      	url_filter:'',
		      	url_add:'',
		      	/**
		      	 * Ajax config
		      	 */
		      	url_get:'',
		      	post_loading:0, //change the value to allow loading
		      	get_loading:0, //change the value to allow loading
		      	post_datas:{},
		      	/**
		      	 * 
		      	 */
		      	field_options:{}
		      }
		 },
		 mounted: function(){
			 var self=this;			 
			 /**
			  * 
			  */
			 $('#'+this.id_html).select2({
				 'dropdownCssClass':self.field.model,
				 "language": {
		       "noResults": function(){
		           return 'Aucun resultat <span id="testheros" class="btn btn-outline-success float-right btn-sm m-2" onclick="jQuery(\'#add_'+self.id_html+'\').trigger(\'click\')"> Ajouter le terme </span>';
		       }
				 },
				 escapeMarkup: function (markup) {
		        return markup;
		    }	  
			 });
			 /*
			 $('#'+this.id_html).on('select2:clearing', function (e) {
				 console.log('is open see : select2:clearing');
				 jQuery('#testheros').hover(function(){alert('Hello open');});
			 });
			 */
			 
			 
			 $('#'+this.id_html).on( 'select2:select', function (e) {
				  var data = e.params.data;
				  self.name = data.id;
			    self.select_value();
			 });
			 
			 if(this.model[this.field.model].value && this.model[this.field.model].value.length > 0){
				 this.name = this.model[this.field.model].value[0].target_id;
				 $('#'+this.id_html).val(this.name).trigger("change");
			 }
			 
			 /**
			  * 
			  */
			 var obj = this.field.settings.handler_settings.target_bundles, timeout = 2000;
		    self.vocabulaire_name = obj[Object.keys(obj)[0]];
		    self.url_filter = '/api/form-node/filter-taxonomy-term-popup/'+self.vocabulaire_name;	
		    self.url_add = '/api/form-node/create/terms';	
			
		    /**
		     * Download termes
		     */
		    this.get_terms();
		    /**
		     * custom headers
		     */
		    console.log('Console headers : ', this.headers);
		 },
		 methods: {
			 select_value: function(action='select'){				 
				 var self=this;
				 var val={'target_id':self.name}
	       self.model[self.field.model].value = [val];
				 console.log(self.name);
				 this.$emit('ev_select_value', {'tid':self.name, 'name':self.field.options[self.name], action:action});
			 },
			 add_terme: function(){
				 var self=this;
				 console.log('Add termes');
				 var term = $('.select2-dropdown.'+this	.field.model+' .select2-search__field').val();
				 var post_datas=  {
					 'vid': self.vocabulaire_name,
					 'name': term,
				 }
				 /**
				  * add terms parent
				  */				 
				 if(this.parent_tid && this.parent_tid > 0){
					 post_datas['parent']= this.parent_tid;
				 }
				 this.url_get = this.url_add;
				 this.post_datas = post_datas;
				 
				 this.post_loading= this.post_loading + 1;
				 
			 },
			 get_terms: function(){		    		
	    		var self = this;	
	    		this.url_get = this.url_filter;
	    		this.get_loading=  1;	    		
			 },
			 data_from_ajax: function(datas){
				 console.log(datas);				 
				 if(datas.status){
					 /**
					  * put new termes
					  */
					 if(datas.url == '/api/form-node/create/terms'){
						 var term = datas.data;
						 // on ajoute le terme dans la liste d'options.
						 console.log(this.field.options);
						 console.log(this.field);
						 var options = this.field.options;
						 options[term.tid] = term.name;
						 this.field.options = options;
						 //on ferme le select.
						 $('#'+this.id_html).select2('close');
						 // on selectionne le nouveau term
						 this.name = term.tid;
						 console.log(this.name, term);
						 this.select_value(action='add_new_term');						 
					 }
					 /**
					  * 	Put new termes
					  */
					 else if(datas.url != '/api/form-node/create/terms'){
						 this.field_options = datas.data;
					 }
				 }
			 },	    		
		 },
	 });
	 
	 Vue.component('input_entity_reference_select',{
		 delimiters: ['${', '}'],
		 props: {
		      field:[Object, Array],
		      model:[Object, Array],
		      id_html:{type: String,default: "edit-select"},
		 },
		 template: '#form-template-input-select',
		 data : function () {
		      return {
		    	  name:'',
		      }
		 },
		 mounted: function(){
			 console.log(this.model[this.field.model].value.length > 0);
			 if(this.model[this.field.model].value && this.model[this.field.model].value.length > 0){
				 this.name = this.model[this.field.model].value[0].target_id;
			 }
		 },
		 methods: {
			 select_value: function(event){				 
				 var self=this;
				 var val={'target_id':self.name}
	        self.model[self.field.model].value = [val];	
				 console.log(self.name);
			 }
		 },
     });
  /**
   * input_select
   */
  Vue.component( 'input_select_v2',{ 
      delimiters: ['${', '}'],
      props: {
        label:{type: String,default: "input type text"},
        id_html:{type: String,default: "edit-inputtypetext"},
        classe:{type: String, default: ""},
        input:{type:[Object, Array], default: function () {
            return {'value':''};
        }}, 
        size_option: { type:[Number,String], default: 0 },  
        show_empty_option: { type:[Boolean], default: true },
        options:{ type: [Object, Array],
          default: function () {
              return {'val1':'option 1', 'val2':'option 2', 'valn':'option n'};
            }
        }
      },
      template: '#form-template-select-v2', 
      methods: {
    	  event_input: function(){
    		  this.$emit('ev_input', this.input.value); // by default
    	  }
      }
  });  
  
        /**
         * input_text
         */
        Vue.component( 'input_text_v2', {
        delimiters: ['${', '}'],
        props: {
            label:{type: [String, Boolean],default: "input type text"},
            id_html:{type: String,default: "edit-inputtypetext"},
            classe:{type: String,default: ""},
            required:{type: Boolean,default: false},
            input:{type:[Object, Array], default: function () {
                return {'value':''};
            }}, 
            placeholder:{type: [String,Number], default: ""},
        },
        template: '#form-template-input-v2',
        });

        /**
         * 
         */
        Vue.component( 'input_textarea_v2', {
        delimiters: ['${', '}'],
        props: {
            label:{type: [String, Boolean],default: "input type text"},
            id_html:{type: String,default: "edit-inputtypetext"},
            classe:{type: String,default: ""},
            required:{ type: Boolean,default: false},
            input:{ type:[Object, Array], default: function () {
                return {'value':''};
            }}, 
            placeholder:{type: [String,Number], default: ""},
            rows:{type: Number,default: 5},
            cols:{type: Number,default: 5},
        },
        template: '#form-template-textarea-v2',
        });

        
	  /**
	   * https://stackoverflow.com/questions/23402187/multiple-files-upload-and-using-file-reader-to-preview
	   * 
	   */
	  Vue.component('input_image',{
		    delimiters: ['${', '}'],
		    props: {
		      field:[Object, Array],
		      model:[Object, Array],
		    },
		    template: '#form-template-input-image',
		    data : function () {
		      return {
		        show_progress:true,
		        id_html:'image-'+this.field.model,
		        accept:"image/*",
		        show_file:false,
		      }
		    },
		    mounted:function(){
		      if(this.field.settings.file_extensions != ''){
		        var file_extensions=(this.field.settings.file_extensions).split(" ");
		        var extensions='';
		        $.each(file_extensions, function(i,y){
		            extensions +='image/'+y+',';          
		        });
		        this.accept=extensions;
		      }
		      this.display_input();
		    },
		    methods: {
		      remove_image: function(index){
		        console.log('delete : '+ index);        
		        //lignes.splice(index,1);
		        this.model[this.field.model].image_data.splice(index,1);
		        this.model[this.field.model].target_ids.splice(index,1);
		        console.log(this.model);
		        this.display_input();
		      },
		      display_input: function(){
		        //cardinality
		    	//console.log(this.model[this.field.model].image_data.length);
		        if(parseInt(this.field.cardinality)>=1 && (this.model[this.field.model].image_data.length >= parseInt(this.field.cardinality)) ){
		          this.show_file=false;
		        }else{
		        	this.show_file=true;
		        }
		      },
		      previewImage: function(event) {
		        //  https://www.javascripture.com/FileReader
		        //  https://stackoverflow.com/questions/32556664/getting-byte-array-through-input-type-file/32556944
		        
		          var self = this;
		          // Reference to the DOM input element
		          var input = event.target; 
		          images = event.target.files;
		          //console.log(images[0]);
		          // Ensure that you have a file before attempting to read it
		          if (input.files && input.files.length) {
		              // create a new FileReader to read this image and convert to base64 format
		        	  addFiles(images);		              
		              /**
		               * 
		               */
		              function addFiles(files) {
		            	  var params = [];
		            	  var options={
		            			  maxWidth: 1200,
		            		      canvas: true,
		            		      downsamplingRatio: 0.5,
		            			  orientation: true,  
		            	  };
		            	    return Promise.all([].map.call(files, function (file) {
		            	        return new Promise(function (resolve, reject) {
		            	        	//console.log('Promise')
		            	        	/*
		            	            var reader = new FileReader();
		            	            reader.onloadend = function () {
		            	                resolve({ result: reader.result, file: file });
		            	            };
		            	            reader.readAsDataURL(file);
		            	            /**/
		            	        	setTimeout(function() {
		            	        	/**
		            	        	 * Bibiotheque 
		            	        	 * JavaScript Load Image JS
		            	        	 */
		            	        	loadImage(file, updateResults, options);
		            	        	
		            	        	function updateResults(img, data){
		            	        		//console.log('Promise updateResults')
		            	        		var href = img.src;
		            	        		//console.log('href : ', href)
		            	        		var dataURLStart;
		            	        		{
		            	        	        href = img.toDataURL(file.type + 'REMOVEME');
		            	        	        resolve({ result: href, file: file });
		            	        	        //console.log('Promise updateResults href');
		            	        	    }
		            	        	}	
		            	        	}, 1000);
		            	        });
		            	    })).then(function (results) {
		            	    	//console.log(results);
		            	        results.forEach(function (result) {		            	        	
		            	        	var validation = self.validation_image(result.file);
		            	        	/**
			            	         * Lenght doit etre à la valeur - 1, car on ajoute par la suite
			            	         */
		            	        	if( self.model[self.field.model].image_data.length < self.field.cardinality ){
		            	        		var key_image = self.model[self.field.model].image_data.push({
						                      filename:result.file.name,
						                      link_file:result.result,
						                      src_vignete: '',
						                      progress_value:0,
						                      is_perform_progress:false,
						                      has_error_progress:false,
						                      is_susses_progress:false,
						                      message:'',
						                  });
			            	        	self.validation_image(result.file);
			            	        	params.push({
							              	'file':result.file,
							                'name': self.field.model,
							                'key_image': key_image,
							                'send_image': validation.statue,
							                'message': ( validation.message ) ? validation.message : '',
			            	        	});
		            	        	}
		            	        	self.display_input();
		            	        });
		            	        //console.log(params);
		            	        /**
		            	         * lenght doit etre à la valeur
		            	         */
		            	        if( params.length <= self.field.cardinality ){
		            	        	self.$emit('ev_saveimage', params);
		            	        }
		            	        return results;
		            	    });
		            	}
		          }
		      },   
		      validation_image: function(file){
		    	var self = this;
		    	//console.log(file);
		    	//console.log(self.field);
		    	var size = parseInt( self.field.settings.max_filesize ) * 1000000;
		    	if( size <= file.size ){
		    		var current_file_size = (file.size / 1000000).toFixed(2)
		    		return {statue:false, 'message': 'Le fichier doit péser au plus <b>'+ self.field.settings.max_filesize +'</b>, mais votre fichier pése '+ current_file_size +' MB'}
		    	}
		    	return {statue:true};
		      },
		  },
		  computed:{
		    progress_value:{
		      get: function(){
		        //console.log('image progress manage');
		        //console.log(this.model[this.field.model]);
		        var curentField = this.model[this.field.model];
		        if(curentField.index_image){
		          var indexImage = curentField.index_image - 1;
		          this.model[this.field.model].image_data[indexImage].progress_value = this.model[this.field.model].percent;
		          this.model[this.field.model].image_data[indexImage].is_perform_progress = (this.model[this.field.model].percent < 100)?true:false;
		          this.model[this.field.model].image_data[indexImage].has_error_progress = (this.model[this.field.model].status)?false:true;
		          this.model[this.field.model].image_data[indexImage].is_susses_progress = (this.model[this.field.model].percent == 100 && this.model[this.field.model].status)?true:false;
		        }        
		        //console.log(this.model[this.field.model]);
		        //this.is_perform_progress = (this.model[this.field.model].percent < 100)?true:false;
		        //this.has_error_progress = (this.model[this.field.model].status)?false:true;
		        //this.is_susses_progress = (this.model[this.field.model].percent == 100 && this.model[this.field.model].status)?true:false;
		        return this.model[this.field.model].percent;
		      }
		    },
		  },
	});	  
	  /**
	   * input_file
	   */
	  Vue.component('input_file',{
	    delimiters: ['${', '}'],
	    props: {
	      field:[Object, Array],
	      model:[Object, Array],      
	    },
	    template: '#form-template-input-file',
	    data : function () {
	      return {
	        show_progress:true,
	        id_html:'file-'+this.field.model,
	        accept:"text/plain",
	        show_file:false,
	        //progress_value:0,
	        //is_perform_progress:false,
	        //has_error_progress:false,
	        //is_susses_progress:false,
	      }
	    },
	    mounted:function(){
	      if(this.field.settings.file_extensions != ''){
	        var file_extensions=(this.field.settings.file_extensions).split(" ");
	        var extensions='';
	        $.each(file_extensions, function(i,y){
	          if(y=="txt"){
	            extensions +='text/plain,'; 
	          }else if(y=="mp4"){
	            extensions +='video/mp4,';
	          }else if(y=="webm"){
	            extensions +='video/webm,';
	          }else if(y=="ogg"){
	            extensions +='video/ogg,';
	          }          
	          else{
	            extensions +='application/'+y+',';   
	            extensions +='application/vnd.'+y+',';
	          }
	        });
	        this.accept=extensions;
	      }
	      this.display_input();
	      
	    },
	    methods: {
	      remove_image: function(index){
	        console.log('delete : '+ index);        
	        //lignes.splice(index,1);
	        this.model[this.field.model].image_data.splice(index,1);
	        this.model[this.field.model].target_ids.splice(index,1);
	        //console.log(this.model);
	        // add fonction to remove on server
	        this.display_input();
	      },
	      display_input: function(){
	        /**
	         * 	cardinality
	         */
	        //console.log(this.model[this.field.model].image_data.length);
	        if( (parseInt(this.field.cardinality) >= 1) && (this.model[this.field.model].image_data.length >= parseInt(this.field.cardinality)) ){
	        	this.show_file=false;
	        }else{
	        	//console.log('show input file : '+parseInt(this.field.cardinality));
	        	this.show_file=true;
	        }
	      },
	      previewImage: function(event) {
	        //  https://www.javascripture.com/FileReader
	        //  https://stackoverflow.com/questions/32556664/getting-byte-array-through-input-type-file/32556944
	        //  
	          //var key_image = new Date().getTime();
	          var self = this;
	          // Reference to the DOM input element
	          var input = event.target; console.log(event);
	          // Ensure that you have a file before attempting to read it
	          if (input.files && input.files[0]) {
	            
	        	  addFiles(input.files);		              
	              /**
	               * 
	               */
	              function addFiles(files) {
	            	  var params = [];
	            	  var options={
	            			  maxWidth: 1200,
	            		      canvas: true,
	            		      downsamplingRatio: 0.5,
	            			  orientation: true,  
	            	  };
	            	    return Promise.all([].map.call(files, function (file) {
	            	        return new Promise(function (resolve, reject) {
	            	        	console.log('Promise')
	            	        	setTimeout(function() {
		            	            var reader = new FileReader();
		            	            reader.onloadend = function () {
		            	                resolve({ result: reader.result, file: file });
		            	            };
		            	            reader.readAsDataURL(file);
	            	        	}, 1000);
	            	        });
	            	    })).then(function (results) {
	            	    	//console.log(results);
	            	        results.forEach(function (result) {		            	        	
	            	        	var validation = self.validation_image(result.file);
	            	        	var src_vignete = vigneteIconFile(result.file.type);
	            	        	if( self.model[self.field.model].image_data.length < self.field.cardinality ){
	            	        		var key_image = self.model[self.field.model].image_data.push({
					                      filename:result.file.name,
					                      link_file:'#',
					                      src_vignete: src_vignete,
					                      progress_value:0,
					                      is_perform_progress:false,
					                      has_error_progress:false,
					                      is_susses_progress:false,
					                      message:'',
					                  });
		            	        	self.validation_image(result.file);
		            	        	params.push({
						              	'file':result.file,
						                'name': self.field.model,
						                'key_image': key_image,
						                'send_image': validation.statue,
						                'message': ( validation.message ) ? validation.message : '',
		            	        	});
	            	        	}
	            	        	self.display_input();
	            	        });
	            	        //console.log(params);
	            	        if( params.length <= self.field.cardinality ){
	            	        	self.$emit('ev_saveimage', params);
	            	        }
	            	        return results;
	            	    });
	            	}
	        	  /*
	              // create a new FileReader to read this image and convert to base64 format
	              var readerfile = new FileReader();
	              // Define a callback function to run, when FileReader finishes its job
	              readerfile.onload = (e) => {
	                  // Note: arrow function used here, so that "this.model[this.field.model].image_data refers to the imageData of Vue component
	                  // Read image as base64 and set to this.model[this.field.model].image_data
	                    
	                    var src_vignete = vigneteIconFile(input.files[0].type);
	                    var key_image = this.model[this.field.model].image_data.push({
	                      filename:input.files[0].name,
	                      link_file:'#',
	                      src_vignete: src_vignete,
	                      progress_value:0,
	                      is_perform_progress:false,
	                      has_error_progress:false,
	                      is_susses_progress:false,
	                    });
	                    var params={
	                        'file':input.files[0],
	                        'name': this.field.model,
	                        'key_image': key_image,
	                    };
	                    self.$emit('ev_saveimage', params);
	                    $('#'+self.id_html).val('');
	                    //
	                    self.display_input();
	                  
	              }
	              // Start the reader job - read file as a data url (base64 format)
	              readerfile.readAsDataURL(input.files[0]);
	              /* */
	              
	          }
	      },  
	      validation_image: function(file){
		    	var self = this;
		    	//console.log(file);
		    	//console.log(self.field);
		    	var size = parseInt( self.field.settings.max_filesize ) * 1000000;
		    	if( size <= file.size ){
		    		var current_file_size = (file.size / 1000000).toFixed(2)
		    		return {statue:false, 'message': 'Le fichier doit péser au plus <b>'+ self.field.settings.max_filesize +'</b>, mais votre fichier pése '+ current_file_size +' MB'}
		    	}
		    	return {statue:true};
		  },
	  },
	  computed:{
	    progress_value:{
	      get: function(){
	        //console.log('image progress manage');
	        //console.log(this.model[this.field.model]);
	        var curentField = this.model[this.field.model];
	        if(curentField.index_image){
	          var indexImage = curentField.index_image - 1;
	          this.model[this.field.model].image_data[indexImage].progress_value = this.model[this.field.model].percent;
	          this.model[this.field.model].image_data[indexImage].is_perform_progress = (this.model[this.field.model].percent < 100)?true:false;
	          this.model[this.field.model].image_data[indexImage].has_error_progress = (this.model[this.field.model].status)?false:true;
	          this.model[this.field.model].image_data[indexImage].is_susses_progress = (this.model[this.field.model].percent == 100 && this.model[this.field.model].status)?true:false;
	        }        
	        //console.log(this.model[this.field.model]);
	        //this.is_perform_progress = (this.model[this.field.model].percent < 100)?true:false;
	        //this.has_error_progress = (this.model[this.field.model].status)?false:true;
	        //this.is_susses_progress = (this.model[this.field.model].percent == 100 && this.model[this.field.model].status)?true:false;
	        return this.model[this.field.model].percent;
	      }
	    },
	  },
	  beforeUpdate (){
	     
	  },
	  updated (){
	    
	  },
	  });	
	  /**
	   * input_integer
	   */
	  Vue.component('input_integer',{
		    delimiters: ['${', '}'],
		    props: {
		      label:{type: String,default: "input type text"},
		      id_html:{type: String,default: "edit-inputtypetext"},
		      name:[Object, Array],
		      field:[Object, Array],
		    },
		    template: '#form-template-integer',
		    data : function () {
		      return {
		        message_prefix:'',
		        message_suffix:'',
		        min:null,
		        max:null,
		      }
		    },
		    mounted: function(){
		      if(this.field.settings.max && this.field.settings.max != ''){
		        this.max = this.field.settings.max;
		      }
		      if(this.field.settings.min && this.field.settings.min != ''){
		        this.min = this.field.settings.min;
		      }
		    },
		    computed: {
		      integer_group:{
		        get: function(){
		         if(this.field.settings.suffix && this.field.settings.suffix !=""){
		           return 'input-group mb-2';
		         }
		          return '';
		        }
		      },
		      prefix:{
		        get: function(){
		          if(this.field.settings.prefix && this.field.settings.prefix !=""){
		            this.message_prefix=this.field.settings.prefix;
		            return true;
		          }
		          return false;
		        }
		      },
		      suffix:{
		        get: function(){
		          if(this.field.settings.suffix && this.field.settings.suffix !=""){
		            this.message_suffix = this.field.settings.suffix;
		            return true;
		          }
		          return false;
		        }
		      },
		    },
		    beforeUpdate (){
		      //this.$emit('value_have_change');
		    },
	});	  
	  
	  /**
	   * input_integer
	   */
	  Vue.component('input_integer_number',{
		    delimiters: ['${', '}'],
		    props: {
		      label:{type: String,default: "input type text"},
		      id_html:{type: String,default: "edit-inputtypetext"},
		      name:[Object, Array],
		      field:[Object, Array],
		    },
		    template: '#form-template-integer',
		    data : function () {
		      return {
		        message_prefix:'',
		        message_suffix:'',
		        min:null,
		        max:null,
		        /**
		         * For typing wait
		         */
		        doneTypingInterval:typingWait,
		        typingTimer:null,
		      }
		    },
		    mounted: function(){
		      if(this.field.settings.max && this.field.settings.max != ''){
		        this.max = this.field.settings.max;
		      }
		      if(this.field.settings.min && this.field.settings.min != ''){
		        this.min = this.field.settings.min;
		      }
		    },
		    methods: {
		    	validation_string: function(event){
		    		var self=this;
		    		self.currentTag = event;
		    		clearTimeout(self.typingTimer);
		    		self.typingTimer = setTimeout(self.validate_value, 800);
		    	},
		    	validate_value: function(event=null){
		    		if(!event){
		    			event = this.currentTag;
		    		}		    		
		    		/**
		    		 * check if field is required
		    		 */
		    		//console.log(this.field, this.name)
		    		var id=$(event.target).attr('id');
		    		if(this.field.require){
		    			if(!this.name.value || this.name.value == ''){
		    				$(event.target).addClass('is-invalid');
		    				$('label[for="'+id+'"]').addClass('text-danger');
		    			}else{
		    				$(event.target).removeClass('is-invalid');
		    				$('label[for="'+id+'"]').removeClass('text-danger');
		    			}
		    		}
		    	}
		    },
		    computed: {
		      integer_group:{
		        get: function(){
		         if(this.field.settings.suffix && this.field.settings.suffix !=""){
		           return 'input-group mb-2';
		         }
		          return '';
		        }
		      },
		      prefix:{
		        get: function(){
		          if(this.field.settings.prefix && this.field.settings.prefix !=""){
		            this.message_prefix=this.field.settings.prefix;
		            return true;
		          }
		          return false;
		        }
		      },
		      suffix:{
		        get: function(){
		          if(this.field.settings.suffix && this.field.settings.suffix !=""){
		            this.message_suffix = this.field.settings.suffix;
		            return true;
		          }
		          return false;
		        }
		      },
		    },
		    beforeUpdate (){
		      //this.$emit('value_have_change');
		    },
	});
	/**
	 * 
	 */  
	Vue.component('input_datetime',{
		    delimiters: ['${', '}'],
		    props: {
		      label:{type: String,default: "input type text"},
		      id_html:{type: String,default: "edit-inputtypetext"},
		      name:[Object, Array],   
		      field:[Object, Array],
		    },
		    methods: {
		      oninput: function (event) {
		        this.$emit('input', event.target.value); // by default
		      },
		      returnDate: function(date){
		        if(date != ''){
		          var curent = date.split('T');
		          if(curent[0] && curent[1]){
		            curentDate = curent[0].split('-');
		            return curentDate[2]+'-'+curentDate[1]+'-'+curentDate[0];
		          }else{            
		            curentDate = date.split('-'); 
		            return curentDate[2]+'-'+curentDate[1]+'-'+curentDate[0];
		          } 
		        }
		        return '';
		      },
		      returnHour: function(date){
		        if(date != ''){
		          var curent = date.split('T');
		          if(curent[0] && curent[1]){
		            curentDate = curent[1].split(':');
		            return curentDate[0]+':'+curentDate[1];
		          }else{
		            return '';
		          } 
		        }
		        return '';
		      }
		    },
		    template: '#form-template-input-datetime',
		    mounted: function(){
		      var self=this;
		      // add plugin datepicker in tag  
		      $('#'+self.id_html).datepicker({
		        dateFormat: "dd-mm-yy",
		        onSelect :function(currentDate, obj){
		          currentDate = self.returnDate(currentDate);
		          //console.log(currentDate);          
		          var h = (self.heure_value != '')?self.heure_value+':00':'00:00:00';
		          self.name.value = currentDate+'T'+h;
		          self.$emit('input', currentDate);
		        },
		      });
		      $('#trigger-'+self.id_html).click(function(e){
		        e.preventDefault();
		        if($('#'+self.id_html).datepicker("widget").is(":visible")){
		          $('#'+self.id_html).datepicker("hide");
		        }else{ console.log('is hidden');
		          $('#'+self.id_html).datepicker( "show" ); 
		        }
		      });
		      $('#clock'+self.id_html).clockpicker({
		        donetext: '',
		        autoclose: true,
		      });
		    },
		    computed: {
		      id_html_trigger: {
		        get: function (){          
		          return 'trigger-'+this.id_html
		        }
		      },
		      date_value: {
		        get: function (){     
		          if(this.name.value){
		            return this.returnDate(this.name.value);
		          }
		          else{
		            return '';
		          }
		        },
		        set: function (currentDate){
		          console.log(currentDate);
		          currentDate = this.returnDate(currentDate);
		          var h = (this.heure_value != '')?this.heure_value+':00':'00:00:00';
		          this.name.value = currentDate+'T'+h;
		        },
		      },
		      heure_value: {
		        get: function (){     
		          if(this.name.value){
		            var curent = this.name.value.split('T');
		            curentDate = curent[1].split(':');
		            return curentDate[0]+':'+curentDate[1];
		          }
		          else{
		            return '';
		          }
		        },
		        set : function(e){
		          console.log(e);
		          h = e+':00';
		          var currentDate = this.returnDate(this.date_value);
		          this.name.value = currentDate+'T'+h;
		        }
		      },
		    },
		    beforeUpdate (){
		      //console.log(this.name);
		    },
		    
	});
	/**
	 * 
	 */
	  Vue.component('input_date',{
		    delimiters: ['${', '}'],
		    props: {
		      label:{type: String,default: "input type text"},
		      id_html:{type: String,default: "edit-inputtypetext"},
		      name:[Object, Array],   
		    },
		    methods: {
		      oninput: function (event) {
		        this.$emit('input', event.target.value); // by default
		      },
		      returnDate: function(date){
		        if(date != ''){
		          var curent = date.split('T');
		          if(curent[0] && curent[1]){
		            curentDate = curent[1].split(':');
		            return curentDate[0]+':'+curentDate[1];
		          }else{
		            curentDate = date.split('-'); 
		            return curentDate[2]+'-'+curentDate[1]+'-'+curentDate[0];
		          } 
		        }
		        return '';
		      },
		    },
		    template: '#form-template-input-date',
		    mounted: function(){
		      var self=this;
		      // add plugin datepicker in tag  
		      $('#'+self.id_html).datepicker({
		        dateFormat: "dd-mm-yy",
		        onSelect :function(currentDate, obj){
		          currentDate = self.returnDate(currentDate);
		          console.log(currentDate);          
		          //self.$emit('input', currentDate);
		          self.name.value = currentDate;
		        },
		      });
		      $('#trigger-'+self.id_html).click(function(e){
		        e.preventDefault();
		        if($('#'+self.id_html).datepicker("widget").is(":visible")){
		          $('#'+self.id_html).datepicker("hide");
		        }else{ console.log('is hidden');
		          $('#'+self.id_html).datepicker( "show" ); 
		        }
		      });
		    },
		    computed: {
		      id_html_trigger: {
		        get: function (){          
		          return 'trigger-'+this.id_html
		        }
		      },
		      date_value: {
		        get: function (){     
		          if(this.name.value){
		            return this.returnDate(this.name.value);
		          }
		          else{
		            return '';
		          }
		        },
		        set: function (currentDate){
		          console.log(currentDate);
		          //this.$emit('input', currentDate);
		          currentDate = this.returnDate(currentDate);
		          this.name.value = currentDate;
		        },
		      },
		    },    
		    beforeUpdate (){
		      console.log(this.name);
		    },
	});	  
	  /**
	   * 
	   */
	  Vue.component('ckeditor', {
		    template: `<div class="ckeditor"><textarea :id="id" :value="value" class="form-control" rows="12"></textarea></div>`,
		    props: {
		        value: {
		          type: String
		        },
		        id: {
		          type: String,
		          default: 'editor'
		        },
		        height: {
		          type: String,
		          default: '90px',
		        },
		        toolbar: {
		          type: Array,
		          default: () => [
		            ['Source','Preview'],
		            ['Undo','Redo'],
		            ['Bold','Italic','Strike',"RemoveFormat","Superscript","Subscript"],
		            ['NumberedList','BulletedList'],
		            ['Cut','Copy','Paste',"PasteText","PasteFromWord"],
		            ["JustifyLeft","JustifyCenter",'JustifyRight','JustifyBlock'],
		            ['Link','Unlink','Anchor'],
		            ['Find','Replace','SelectAll','Scayt'],
		            ['colordialog','imagebrowser','simage','image'],
		          ]
		        },
		        language: {
		          type: String,
		          default: 'en'
		        }
		      },
		      data : function () {
	          return {
	        	  extraplugins: '',    
	          	//extraplugins: 'dialog,a11yhelp,about,clipboard,colorbutton,widget,widgetselection,btbutton,templates,sourcedialog',
	          }
	        },
		      watch: {
		        value: function(){ //console.log('watch update ckeditor'); 
		          const ckeditorId = this.id
		          if (this.value !== CKEDITOR.instances[ckeditorId].getData()) {
		            CKEDITOR.instances[ckeditorId].setData(this.value)
		          }
		        },
		      },
		      beforeUpdate () {  
		      },
		      mounted () {
		        const ckeditorId = this.id
		        //console.log(this.value)
		        //console.log(this.height);
		        const ckeditorConfig = {
		          		toolbar : [
		          			{ name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
		          			
		          			{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
		          			{ name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
		          			{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
		          			'/',
		          			{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
		          			{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
		          			{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
		          			{ name: 'insert', items: [ 'Image', 'CodeSnippet', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
		          			'/',
		          			{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
		          			{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
		          			{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
		          			{ name: 'about', items: [ 'About' ] }
		          			/**/
		          		],
		          language: this.language,
		          height: this.height,
		          extraPlugins: this.extraplugins,
		          stylesSet:[],
		          contentsCss:[],
		          on: {
	              instanceReady: function( ev ) {
	                  // Output paragraphs as <p>Text</p>.
	              	if(this.dataProcessor.writer && this.dataProcessor.writer.setRules){
	              		this.dataProcessor.writer.setRules( 'p', {
                      indent: false,
                      breakBeforeOpen: true,
                      breakAfterOpen: false,
                      breakBeforeClose: false,
                      breakAfterClose: true
	              		});
	              		
	              		this.dataProcessor.writer.setRules( 'div', {
	                	  indent: true,
	                      breakBeforeOpen: true,
	                      breakAfterOpen: true,
	                      breakBeforeClose: true,
	                      breakAfterClose: true
	                  });
	              		
	              	}
	                  
	                  
	              }
	          },
	          toolbarGroups: [
              { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
              { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
              { name: 'links' },
              { name: 'insert' },
              { name: 'tools' },
              { name: 'others' },
              { name: 'basicstyles', groups: [ 'basicstyles'] },
              { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
              { name: 'styles' },
              { name: 'colors' }
             ],
		        };
		        CKEDITOR.replace(ckeditorId, ckeditorConfig);
		        CKEDITOR.instances[ckeditorId].setData(this.value);
		        //CKEDITOR.config.extraPlugins = 'simage, linkbutton,timestamp';
		        //allow all html
		        CKEDITOR.config.allowedContent = true;
		        CKEDITOR.config.htmlEncodeOutput = false;
		        CKEDITOR.config.entities = false;
		        //CKEDITOR.config.entities_processNumerical = 'force';
		        
		        CKEDITOR.dtd.$removeEmpty.span = 0;
		        CKEDITOR.dtd.$removeEmpty.i = 0;
		        CKEDITOR.dtd.$removeEmpty.label = 0;
		        //console.log(CKEDITOR.config);
		        CKEDITOR.instances[ckeditorId].on('change', () => {
		          let ckeditorData = CKEDITOR.instances[ckeditorId].getData()
		          if (ckeditorData !== this.value) {
		            this.$emit('input', ckeditorData)
		          }
		        });
		      },
		      destroyed () {
		        const ckeditorId = this.id
		        if (CKEDITOR.instances[ckeditorId]) {
		          CKEDITOR.instances[ckeditorId].destroy()
		        }
		      }
		    
	});	 
	
	  /// textarea_html s
	  Vue.component('input_textarea_html',{
	    delimiters: ['${', '}'],
	    props: {
	      label:{type: String,default: "input type text"},
	      id_html:{type: String,default: "edit-inputtypetext"},
	      name:[Object, Array],   
	      field:[Object, Array],
	    },
	    template: '#form-template-textarea-html',
	    data : function () {
	      return {
	        height: '300px',
	      }
	    },
	    beforeUpdate (){
	      //this.$emit('value_have_change');
	    },
	  });
	  
	  ///component input_text   **************************************************
	  Vue.component('input_text',{
	    delimiters: ['${', '}'],
	    props: {
	      label:{type: String,default: "input type text"},
	      id_html:{type: String,default: "edit-inputtypetext"},
	      name:[Object, Array],  
	      field:[Object, Array],
	    },
	    template: '#form-template-input-text',
	    data : function () {
	      return {
	        maxlength:"",
	      }
	    },
	    mounted: function(){
	      if(this.field.settings && this.field.settings.max_length && this.field.settings.max_length > 0){
	        this.maxlength = this.field.settings.max_length;
	      }      
	    },
	    beforeUpdate (){ console.log('before Update text');
	      this.$emit('value_have_change');
	    },
	    
	  });
	  /**
	   * 
	   */
	  Vue.component('input_string_string_textfield',{
		    delimiters: ['${', '}'],
		    props: {
		      label:{type: String,default: "input type text"},
		      id_html:{type: String,default: "edit-inputtypetext"},
		      name:[Object, Array],  
		      field:[Object, Array],
		    },
		    template: '#form-template-input-text',
		    data : function () {
		      return {
		        maxlength:"",
		        /**
		         * For typing wait
		         */
		        doneTypingInterval:typingWait,
		        typingTimer:null,
		        /**
		         * ce champs prends la valeur de l'element encours de MAJ (event), le passé à une fonction dans setTimeout, le déclenche
		         */
		        currentTag:null,
		      }
		    },
		    mounted: function(){
		      if(this.field.settings && this.field.settings.max_length && this.field.settings.max_length > 0){
		        this.maxlength = this.field.settings.max_length;
		      }      
		    },
		    methods: {
		    	validation_string: function(event){
		    		var self=this;
		    		self.currentTag = event;
		    		clearTimeout(self.typingTimer);
		    		self.typingTimer = setTimeout(self.validate_value, 800);
		    	},
		    	validate_value: function(event=null){
		    		if(!event){
		    			event = this.currentTag;
		    		}		    		
		    		/**
		    		 * check if field is required
		    		 */
		    		//console.log(this.field, this.name)
		    		var id=$(event.target).attr('id');
		    		if(this.field.require){
		    			if(!this.name.value || this.name.value == ''){
		    				$(event.target).addClass('is-invalid');
		    				$('label[for="'+id+'"]').addClass('text-danger');
		    			}else{
		    				$(event.target).removeClass('is-invalid');
		    				$('label[for="'+id+'"]').removeClass('text-danger');
		    			}
		    		}
		    	}
		    },
		    beforeUpdate (){ //console.log('before Update text');
		      this.$emit('value_have_change');
		    },
		    
		  });
	  
	  /**
	   * <send_data_ajax :url="url_get"  @ev_data_from_ajax="data_from_ajax"  :datas="post_datas" :loading="post_loading"></send_data_ajax>
	   */
	  Vue.component('send_data_ajax',{
	    delimiters: ['${', '}'],
	    props: {
	    	url:{type: [String], default: false},
	    	header_content_type:{type: [String], default: 'application/json'},
	    	header_accept:{type: [String], default: 'application/json'},
	    	datas: {type: [Object, Array, String, Number]},
	    	protocole: {type: [String], default: 'POST'},
	    	loading:{type: [Number]},
	    },
	    data: function(){
	    	return {
	    		
	    	}
	    },
	    watch: {
	    	loading: function(){
	    		console.log('prepare to save by Ajax, endpoint : ', this.url);
	          if(this.loading && this.loading > 0 ){
	            this.load_datas();
	          }
	        }
	    },
	    methods: {
	    	load_datas: function(){
	    		var self=this;
	    		if(!self.url && self.url !=''){
	    			self.$emit('ev_data_from_ajax', {status:false, 'url':self.url, data:['URL not define']}); 
	    			return false;
	    		}
	    		function getCsrfToken(callback) {
	    	    jQuery
	    	      .get(Drupal.url('rest/session/token'))
	    	      .done(function (data) {
	    	        var csrfToken = data;
	    	        callback(csrfToken);
	    	      });
	    	  }
	    		
	    		getCsrfToken(function(csrfToken) {self.postEntity(csrfToken, self.datas);});
	    	},
	    	postEntity: function(csrfToken, entity) {
	        var self = this;
	        //console.log(entity);
	        var datas;
	        var headers = {
	          'Content-Type': self.header_content_type,
	          'X-CSRF-Token': csrfToken, 
	          'Accept': self.header_accept,
	        };
	        datas = JSON.stringify(entity);
	        jQuery.ajax({
	          url: self.url,
	          method: self.protocole,
	          headers: headers,
	          data: datas,
	          success: function (data) {
	          	self.$emit('ev_data_from_ajax', {status:true, 'url':self.url, data:data}); ;
	          },
	          error: function (error) { 
	          	self.$emit('ev_data_from_ajax', {status:false, 'url':self.url, data:error});
	          }
	        });
	      },
	    },
	    template: '<div class="d-none loadData ajax"></div>',
});

    /**
     * 
     */
    Vue.component('input_field_json_type',{
        delimiters: ['${', '}'],
	    props: {
	      field:[Object, Array],
		  model:[Object, Array],
		  id_html:{type: String,default: "edit-select2"},
	    },
	    template: '#form-template-field-json-type',
	    data : function () {
	      return {
            maxlength:"",
            template_modelisation_header:'',
            template_modelisation_body:'',
            show_header:false,
            show_body:false,
            current_object:{},
            modelisation:{},
	      }
        },
        mounted: function(){
            /**
             * 
             */
            if(this.model[this.field.model].value_json && this.model[this.field.model].value_json != ''){
                this.modelisation = JSON.parse(this.model[this.field.model].value_json);
            }else{
                this.modelisation={};
            }
            /**
             * set default value
             */
            this.set_defaultValue();
            /**
             * affichage
             */
            this.display_modalisation();
            
        },
        methods: {
            manage_datas: function($datas){
                var self = this;
                console.log($datas);
                this.hidden_popup();
                if($datas.status){
                    if($datas.action == 'add_container'){
                        self.add_container_json($datas.titre, $datas.desc);
                    }
                }
            },
            add_container_json: function(name, desc){
                console.log('add container');
                var self = this;
                self.modelisation={
                        container:{
                            'name':name,
                            'desc':desc,
                        }
                }
                self.model[self.field.model].value_json=[];
;               self.model[self.field.model].value_json = JSON.stringify(self.modelisation);
            },
            display_modalisation: function(){
                var self = this;
                self.template_modelisation_body = 'modelisation_body';
                self.show_body = true;
            },
            set_defaultValue: function(){
                var self = this;
                if(this.modelisation && this.modelisation.container){
                    var container = this.modelisation.container;
                    self.current_object = {
                        'name':{value:container.name},
                        'desc':{value:container.desc},
                    };
                }else{
                    self.current_object={
                        'name':{value:''},
                        'desc':{value:''},
                    };
                }
            },
            add_container: function(){
                this.template_modelisation_header = 'modelisation-container';
                this.show_header=true;
                /*
                this.current_object={
                    name:{value:''},
                    desc:{value:''}
                }
                */
                if( $('#mvc-'+this.id_html).hasClass('open') ){
                    $('#mvc-'+this.id_html+' .custom-popup-background').fadeIn(600);
                }else{
                    $('#mvc-'+this.id_html+' .custom-popup-background').fadeOut(600);
                }
            },
            hidden_popup: function(){
                this.show_header=false;
                $('#mvc-'+this.id_html+' .custom-popup-background').fadeOut(600);
            },
            add_function: function(){

            },
            zoom_space: function(){
                if( $('#mvc-'+this.id_html).hasClass('open') ){
                    $('#mvc-'+this.id_html).removeClass('open');
                }else{
                    $('#mvc-'+this.id_html).addClass('open');
                }
            },

        },
    });

    Vue.component( 'modelisation-container', {
        delimiters: ['${', '}'],
        template: '#template-modelisation-container',
        props: {
            datas:[Object, Array],
        },
        methods: {
            save_datas: function(){
                this.$emit('ev_manage_datas', {status:true, action:'add_container', titre:this.datas.name.value, desc:this.datas.desc.value } ); 
            }
        }
    });

    Vue.component( 'modelisation_body', {
        delimiters: ['${', '}'],
        template: '#template_modelisation_body',
        props: {
            modelisation:[Object, Array],
        },
        methods: {
            
        }
    });

	  
	  /**
	   * <get_data_ajax :url="url_get"  @ev_data_from_ajax="data_from_ajax" :loading="get_loading"></get_data_ajax>
	   */
	  Vue.component('get_data_ajax',{
	    delimiters: ['${', '}'],
	    props: {
	    	url:{type: [String], default: false},
	    	header_content_type:{type: [String], default: 'application/json'},
	    	header_accept:{type: [String], default: 'application/json'},
	    	protocole: {type: [String], default: 'GET'},
	    	loading:{type: [Number]},
	    	headers:[Object],
	    },
	    mounted: function(){
	    	console.log('custom header AJAX :', this.headers);
	    },
	    data: function(){
	    	return {
	    		
	    	}
	    },
	    watch: {
	    	loading: function(){
	    		console.log('prepare to load by Ajax, endpoint : ', this.url);
	          if(this.loading && this.loading > 0 ){
	            this.load_datas();
	          }
	        }
	    },
	    methods: {
	    	load_datas: function(){
	    		var self=this;
	    		if(!self.url && self.url !=''){
	    			self.$emit('ev_data_from_ajax', {status:false, 'url':self.url, data:['URL not define']}); 
	    			return false;
	    		}
	    		self.getEntity();
	    	},
	    	getEntity: function() {
	        var self = this;
	        //console.log(entity);
	        var datas;
	        var headers = {
	          'Content-Type': self.header_content_type,
	          'Accept': self.header_accept,
	        };
	        headers = $.extend({}, headers, self.headers);
	        jQuery.ajax({
	          url: self.url,
	          method: self.protocole,
	          headers: headers,
	          success: function (data) {
	          	self.$emit('ev_data_from_ajax', {status:true, 'url':self.url, data:data}); ;
	          },
	          error: function (error) { 
	          	self.$emit('ev_data_from_ajax', {status:false, 'url':self.url, data:error});
	          }
	        });
	      },
	    },
	    template: '<div class="d-none loadData ajax"></div>',
});
	 	  
	  /**
	   * 
	   */
	  function generate_schema_form(data, entity_relation){
		    
		    // more infos
		    // https://icebob.gitbooks.io/vueformgenerator/content/installation.html
		    // https://blog.rangle.io/how-to-create-data-driven-user-interfaces-in-vue/
		    // https://vuejsfeed.com/blog/generate-forms-using-json-schema-and-vue-js
		    // https://jsfiddle.net/mani04/5zyozvx8/
		    // https://stackoverflow.com/questions/49106045/preview-an-image-before-it-is-uploaded-vuejs
		    // https://github.com/vue-generators/vue-form-generator/issues/226 (
		    // how to add bouton "add more" )
		    // https://antonreshetov.github.io/vue-form-components/#/components/input
		    // (genrateur de form beau design )
		    datasOrders={};
		    $.each(data, function(j,k){
		      if(k.weight || k.weight == 0){
		        var i = Math.abs(k.weight);
		        if(!datasOrders[i]){ datasOrders[i]=k;}else{
		          var cond=true;
		          while (cond) {
		            i++;
		            if(!datasOrders[i] || i==150){ datasOrders[i]=k; cond=false; }
		          }
		        }
		      }      
		    });
		    
		    var fields = new Array(); var model = {}; var configs = defaultFieldNotDisplay();
		    
		    $.each(datasOrders, function( key, value ) {
                //console.log('value.type : ',key, value.type)
		    	//console.log(value.type);
		      // put filed config  
		      if(configs[value.name]  ){
		        configs[value.name]=value;
		      }
		      else if(value.type == "string"){
		    	//console.log('template '+value.label+' : ', 'input_'+value.type +'_'+ value.type_input);
		        fields.push({
		        	type: value.type +'_'+ value.type_input,
		            inputType: "string",
		            label: value.label,
		            model: value.name,
		            settings:value.settings,
		            cardinality:value.cardinality,
		            require:value.require,
		            /**
					    * add description
					    */
				        description: (value.description && value.description != '') ? value.description : false,
		            
		        });
		        model[value.name]={
		            value:'',  
		        };
		        /**
		         * Default value
		         */
		        if(value.defaults && value.defaults.length==1){
			          model[value.name].value=value.defaults[0].value;
			    }
		        /**
		         * Value
		         */
		        if(value.valeur && value.valeur.length==1){
		          model[value.name].value=value.valeur[0].value;
		        }
		      }
		      else if(value.type == "boolean" ){
		    	  //console.log('template '+value.label+' : ', 'input_'+value.type +'_'+ value.type_input);
		    	if("options_buttons0" == value.type_input){
		    		model[value.name]={value:''};
		    		if(value.defaults[0]){
		    			
		    		}
		    	}
		    	else{
			        model[value.name]={
			          value:'',  
			        };
			        if(value.defaults[0]){
			          if(value.defaults[0].value){
			            model[value.name]={
			                value:1,
			            };
			          }else{
			            model[value.name]={
			                value:0,
			            };
			          }          
			        }
		      	}
		        fields.push({
		          type: value.type +'_'+ value.type_input,
		          label: value.label,
		          model: value.name,
		          multi: true,
		          textOn: value.settings.on_label,
		          textOff: value.settings.off_label,
		          settings:value.settings,
		          require:value.require,
		          options:(value.options) ? value.options : [],
		        		  /**
		   			    * add description
		   			    */
		   		        description: (value.description && value.description != '') ? value.description : false,
		        });
		        if(value.valeur && value.valeur.length==1){
		          model[value.name].value=value.valeur[0].value;
		        }
		      }
		      else if(value.type == "list_string"){ 		    	 
		        model[value.name]={
		          value:(value.valeur && value.valeur[0])?value.valeur[0].value:'',  
		        };
		        fields.push({
		          type: "select",
		          label: value.label,
		          model: value.name,
		          values: value.settings.allowed_values,
		          settings:value.settings,
		          cardinality:value.cardinality,
		          require:value.require,
		          /**
				    * add description
				    */
			        description: (value.description && value.description != '') ? value.description : false,
		        });
		      }
		      else if(value.type == "entity_reference"){		    	
		        if(value.settings.target_type == "taxonomy_term"){
		          //console.log(value);		          
		          //console.log('taxonomy_term template '+value.label+' : ', 'input_'+value.type +'_'+ value.type_input);
		          
		          model[value.name]={
		        	value:'',
		            label_term:(value.infosplus)?value.infosplus.title:'',
		            type:"taxonomy_term"
		          };
		          /**
		           * Define the value to update
		           */
		          if(value.valeur && value.valeur[0]){
		        	  model[value.name].value = value.valeur;
		          }
		          fields.push({
		            type:  value.custom_settings ? value.custom_settings.template : value.type +'_'+ value.type_input,//"autocomplete",
		            label: value.label,
		            model: value.name,
		            values: value.settings.allowed_values,
		            settings:value.settings,
		            cardinality:value.cardinality,
		            require:value.require,
		            options:(value.options) ? value.options : [],
		            custom_settings: value.custom_settings,
		            /**
			     	 * add description
			     	 */
			     	description: (value.description && value.description != '') ? value.description : false,
		          });
		          //console.log(model[value.name]);
		        }
		        else if(value.settings.target_type == "node"){
		          var cover=null;
		          model[value.name]={
		              target_ids:[],
		              label_node:(value.infosplus)?value.infosplus.title:'',
		              target_type: "node",
		            };          
		          // put datas
		          if(value.valeur && value.valeur[0]){model[value.name].target_ids=value.valeur[0].target_id;}  
		          else if(entity_relation && entity_relation.id){
		            var bundle = value.settings.handler_settings.target_bundles;
		            bundle = bundle[Object.keys(bundle)[0]];
		            if(bundle==entity_relation.bundle){
		              model[value.name].target_ids=entity_relation.id;
		              model[value.name].label_node=entity_relation.title;
		              cover='cover bg-light';
		            }
		          }
		          fields.push({
		            type: "select_in_modal",
		            label: value.label,
		            model: value.name,
		            values: value.settings.allowed_values,
		            container_class:cover,
		            settings:value.settings,
		            cardinality:value.cardinality,
		            require:value.require,
		            /**
					    * add description
					    */
				        description: (value.description && value.description != '') ? value.description : false,
		          });
		          
		        }
		      }
		      else if(value.type == "image"){
		    	  //console.log('image template '+value.label+' : ', 'input_image');
		        model[value.name]={
		          image_data:[],
		          target_ids:[],
		          typefile:'image',
		          status:true,
		          percent:0,
		          index_image:null,
		        };
		        
		        value.description =value.description;
		        fields.push({
		          type: "image",
		          label: value.label,
		          model: value.name,
		          preview:true,
		          multiple:{
		            number:true,
		            infiny:true,
		          },// valeur.target_ids
		          settings:value.settings,
		          cardinality:value.cardinality,
		          require:value.require,
		          /**
				    * add description
				    */
			        description: (value.description && value.description != '') ? value.description : false,
		        });
		        if(value.valeur && value.valeur.length > 0){
		          $.each(value.valeur, function(t,p){
		            model[value.name].target_ids.push(p);
		            model[value.name].image_data.push(
		                {
		                  filename:'',
		                  link_file:value.infosplus[t].href,
		                  src_vignete: '',
		                  progress_value:100,
		                  is_perform_progress:false,
		                  has_error_progress:false,
		                  is_susses_progress:true,
		               }
		            );
		          });
		        }
		      }
		      else if(value.type == "file"){
		        model[value.name]={
		            image_data:[],
		            target_ids:[],
		            typefile:'file',
		            status:true,
		            percent:0,
		            index_image:null,
		          };
		          fields.push({
		            type: "file",
		            label: value.label,
		            model: value.name,
		            preview:true,
		            multiple:{
		              number:true,
		              infiny:true,
		            },// valeur.target_ids
		            settings:value.settings,
		            cardinality:value.cardinality,
		            require:value.require,
		            /**
					    * add description
					    */
				        description: (value.description && value.description != '') ? value.description : false,
		          });
		          if(value.valeur && value.valeur.length > 0){
		            $.each(value.valeur, function(t,p){
		              model[value.name].target_ids.push(p);
		              model[value.name].image_data.push(
		                {
		                filename:value.infosplus[t].name,
		                link_file:value.infosplus[t].href,
		                src_vignete: vigneteIconFile(value.infosplus[t].minetype),
		                progress_value:100,
		                is_perform_progress:false,
		                has_error_progress:false,
		                is_susses_progress:true,
		                }    
		              );
		            });
		          }
		      }
		      else if(value.type == "text_long" || value.type == "text_with_summary"){
		        fields.push({
		          type: "textarea_html",
		          inputType: "text_long",
		          label: value.label,
		          model: value.name,
		          settings:value.settings,
		          require:value.require,
		          /**
				    * add description
				    */
			        description: (value.description && value.description != '') ? value.description : false,
		      });
		        model[value.name]={
		            processed:'',  // valeur filtrer
		            format:(data.uid.is_admin) ? "full_html":"basic_html",  // format
		          };
		        if(value.valeur && value.valeur.length==1){
		          model[value.name].processed=value.valeur[0].value;
		          model[value.name].format=value.valeur[0].format;
		        }
		    }
		    else if(value.type == "string_long"){
		        fields.push({
		          type: "textarea_string",
		          inputType: "string_long",
		          label: value.label,
		          model: value.name,
		          settings:value.settings,
		          require:value.require,
		          /**
				    * add description
				    */
			        description: (value.description && value.description != '') ? value.description : false,
		      });
		        model[value.name]={
		            value:'',  
		        };
		        if(value.valeur && value.valeur.length==1){
		          model[value.name].value=value.valeur[0].value;
		        }
		    }
		    else if(value.type == "datetime"){
		      fields.push({
		        type: (value.settings.datetime_type == 'datetime')?"datetime":'date',
		        inputType: "timestamp",
		        label: value.label,
		        model: value.name,
		        settings:value.settings,
		        require:value.require,
		        /**
				    * add description
				    */
			        description: (value.description && value.description != '') ? value.description : false,
		    });
		      model[value.name]={
		          value:'',  
		          type:'datetime',
		      };
		      if(value.valeur && value.valeur.length==1){
		        model[value.name].value=value.valeur[0].value;
		      }
		  }
		      
		    else if(value.type == "integer"){
		      //console.log('template '+value.label+' : ', 'input_'+value.type +'_'+ value.type_input);
		      fields.push({
		        type: value.type +'_'+ value.type_input,
		        inputType: "integer",
		        label: value.label,
		        model: value.name,
		        settings:value.settings,
		        require:value.require,
		        /**
			    * add description
			    */
		        description: (value.description && value.description != '') ? value.description : false,
		      });
		      model[value.name]={
		          value:'',  
		          type:'integer',
		      };
		      /**
		       * add default valeur
		       */
		      if(value.defaults && value.defaults.length ==1){
			        model[value.name].value=value.defaults[0].value;
			  }
		      /**
		       * Add valeur (update)
		       */
		      if(value.valeur && value.valeur.length==1){
		        model[value.name].value=value.valeur[0].value;
		      }
            }
            else if( value.type == 'field_json_type' ){
                fields.push({
                    type: value.type,
                    label: value.label,
		            model: value.name,
		            settings:value.settings,
                    require:value.require,
                    /**
			        * add description
			        */
		            description: (value.description && value.description != '') ? value.description : false,
                });

                model[value.name] = {
		          value_json:'',  
		          type:'field_json_type',
                };
                /**
                 * add default valeur
                 */
                if(value.defaults && value.defaults.length ==1){
                        model[value.name].value_json= value.defaults[0].value_json;
                }
                /**
                 * Add valeur (update)
                 */
                if(value.valeur && value.valeur.length==1){
                    model[value.name].value_json=value.valeur[0].value_json;
                }
            }
            
		    });
		    //console.log(model);
		    return {fields, model};
	}
	  
	  
	  /**
		 * 
		 */
	  function getCsrfToken(callback) {
	    jQuery
	      .get(Drupal.url('rest/session/token'))
	      .done(function (data) {
	        var csrfToken = data;
	        callback(csrfToken);
	      });
	  }
	  
	  /**
		 * 
		 */
	  function defaultFieldNotDisplay(){
	    return {
	      'sticky' : true,
	      'revision_default' : true,
	      'promote':true,
	      'default_langcode':true,
	      'content_translation_outdated':true,
	      'revision_log':true,
	      'revision_translation_affected':true,
	      'type':true,
	      'langcode':true,
	      'uuid':true,
	      'nid':true,
	      'status':true,
	    };
	  }
	  /**
		 * 
		 */
	  function postEntity(callback2, csrfToken, entity, url='/node?_format=json') {
	    // console.log(entity);
	    var datas;
	    var headers = {
	      'Content-Type': 'application/json',
	      'X-CSRF-Token': csrfToken, 
	    };
	    datas = JSON.stringify(entity);
	    jQuery.ajax({
	      url: url,
	      method: 'POST',
	      headers: headers,
	      data: datas,
	      success: function (datas) {
	        callback2(datas);
	        console.log(datas);
	      },
	      error: function (error) { console.log('false');
	        console.log(error);
	      }
	    });
	  }
	  
	  /**
		 * 
		 */
	  function patchEntity(callback2, csrfToken, entity, url='/node?_format=json') {
	    console.log(url);
	    var datas;
	    var headers = {
	      'Content-Type': 'application/hal+json',
	      'X-CSRF-Token': csrfToken, 
	    };
	    datas = JSON.stringify(entity);
	    jQuery.ajax({
	      url: url,
	      method: 'PATCH',
	      headers: headers,
	      data: datas,
	      success: function (datas) {
	        callback2(datas);
	        console.log(datas);
	      },
	      error: function (error) { console.log('false');
	        console.log(error);
	      }
	    });
	  }
	  
	  function validNode(formdatas, action='add', defaultfields){
	    // Check if require field not empty
		  var error=false;
		  var fields=[];
		  var configs = defaultFieldNotDisplay();
		  $.each(defaultfields.fields, function(field_name, field){
			  //console.log(field_name);
			  //console.log(defaultfields.fields[field_name]);
			  if(field.require && !configs[field_name]){
				  if(	
						( formdatas.model[field_name].type && formdatas.model[field_name].type == 'integer' && formdatas.model[field_name].value === "" ) ||
						( formdatas.model[field_name].target_ids && formdatas.model[field_name].target_ids instanceof Array && formdatas.model[field_name].target_ids.length === 0 ) ||
						( typeof(formdatas.model[field_name].value) === 'string' && formdatas.model[field_name].value === "" ) ||
						( formdatas.model[field_name].value instanceof Array && formdatas.model[field_name].value.length === 0 ) 
				  ){
					  error=true;  
					  fields.push({'field':field_name, 'infos':'Le champs <strong>'+defaultfields.fields[field_name].label+'</strong> ne doit pas etre vide'})
				  }
			  }
		  });
	    if(error){
	      return {'error':error, 'fields':fields};
	    }
	   return {'error':error};
	  }
	  
	  /**
		 * 
		 */
	  function buildNode(formdatas, action='add', defaultfields){ 
		  //console.log(formdatas);
		  console.log(formdatas.model);
	    var resp = validNode(formdatas, action, defaultfields);
	    if(resp.error){return resp;}
	    var node = {};
	    node['type']=formdatas.settings.type;  
	    
	    if(action == 'edit'){
	      //node['_links']=formdatas.settings._links;
	    }
	    $.each(formdatas.model, function(index, valeur){
	      // save image
	      if((valeur.image_data == "" || valeur.image_data) && valeur.typefile=='image'){
	        if(valeur.target_ids.length > 0){
	          // add default alt
	          $.each(valeur.target_ids, function(key, element){
	            if(valeur.target_ids[key].alt == ""){
	              valeur.target_ids[key].alt = formdatas.model['title'].value;
	            }
	          });
	          node[index] = valeur.target_ids;
	        }else{
	        	node[index]=[];
	        }        
	      }
	      // save image
	      else if((valeur.image_data == "" || valeur.image_data) && valeur.typefile=='file'){
	        if(valeur.target_ids.length > 0){
	          node[index] = valeur.target_ids;
	        }else{
	        	node[index]=[];
	        }
	      }
	      // save term taxonomies
	      else if(valeur.label_term == "" || valeur.label_term){
	    	//console.log(valeur);
	        if(valeur.value  &&  ( valeur.value.length > 0 )){
	          node[index]= valeur.value;
	        }       
	      }
	      // save textarea
	      else if(valeur.format && valeur.format != "" || valeur.processed){
	        node[index]=[{
	            value:  valeur.processed,
	            format: valeur.format,
	        }];
	      }
	      // save reference entity
	      else if(valeur.label_node == "" || valeur.label_node){ // console.log('entity
																	// Node ');
																	// console.log(valeur);
	        if(valeur.target_ids && (valeur.target_ids instanceof String || $.isNumeric(valeur.target_ids) ) ){
	          node[index]=[{
	            target_id:  valeur.target_ids,
	            target_type: valeur.target_type,
	          }];
	        }else if(valeur.target_ids && $.isNumeric() ){
	          $.each(valeur.target_ids, function(k,j){
	            if(j.target_id.length>0){
	                node[index].push({
	                target_id:  j.target_id,
	                target_type: valeur.target_type,
	              })
	            }
	          });
	        }
	        else{
	          node[index]="";
	        }        
	      }
	      // save datetime
	      else if(valeur.type=='datetime'){
	        if(valeur.value instanceof String || valeur.value != ''){
	          node[index]=[
	            {value:valeur.value}
	          ];
	        }else if(valeur.value == ''){
	          node[index]='';
	        }
	      }
	      // save integer
	      else if(valeur.type=='integer'){
	    	  //console.log(valeur);
	        if(valeur.value != '' || valeur.value == 0){
	          node[index]=[
	            {value:valeur.value}
	          ];
	        }else if(valeur.value == ''){
	          node[index]='';
	        }
          }else if(valeur.type=='field_json_type'){
            console.log('index : ', index, valeur);
            node[index]=[{'value_json':valeur.value_json}];
          }
          else{              
	    	  node[index]=[valeur];
	      }	            
	    } );
        /**/
        console.log(node);
	    return node;    
	  }
	  
	  function errorAnalysisDrupal(error){
		  var message = '';
		  if(error.responseJSON && error.responseJSON.message){
			  message = (error.responseJSON.message).split("\n");
			  if(message[1]){ return message[1]; }
			  return error.responseJSON.message;
		  }else if(error.statusText){
			  return error.statusText;
		  }else{
			  return error;
		  }
	  }

	  /**
	   * 
	   */
	  function callback2(datas){
	    console.log('form haved save with succes');
	    console.log('event remove');
	    window.removeEventListener("beforeunload", functionToRun);
	  }
	  /**
	   * 
	   */
	  function functionToRun(e){
	    e.preventDefault();
	    // Chrome requires returnValue to be set
	    e.returnValue = 'hello';
	    return "Les modifications que vous avez apportées ne seront pas enregistrées. \n ";
	  }
	  /**
	   * 
	   */
	  function performedALL(value, fs){
	    $.each(fs, function(i, f){
	      if(f=='getDateinFrench'){value = getDateinFrench(value);}
	      else if(f=='getDateinFrenchByTimestamp'){value = getDateinFrenchByTimestamp(value);}
	    });
	    return value;
	  }
	  
	  /**
	   * 
	   */
	  function getDateinFrench(data){ //console.log(data);
	    data = parseInt(data);console.log(data);
	    var _date = new Date(data);console.log(_date);
	    var french_date = (_date.getDate()) +'/'+ (_date.getMonth() + 1) +'/'+ (_date.getFullYear());
	    return french_date;
	  }
	  /**
	   * 
	   */
	  function getDateinFrenchByTimestamp(data){
	    data = parseInt(data);
	    var _date = new Date(data*1000);
	    var day = _date.getDate();if(day<10){day='0'+day;}
	    var mounth = _date.getMonth() + 1;if(mounth<10){mounth='0'+mounth;}
	    var mn = _date.getUTCMinutes();if(mn<10){mn='0'+mn;}
	    var french_date = day +'/'+ mounth +'/'+ (_date.getFullYear())+' à '+_date.getUTCHours() +'H'+ mn;
	    return french_date;
	  }
	  /**
	   * 
	   */
	  function vigneteIconFile(type){
	    var src_vignete = "/themes/immobilier/img/icon-file/icone-txt.jpg";
	    if(type == 'application/pdf'){ src_vignete = "/themes/immobilier/img/icon-file/icone-pdf.png";}
	    else if(type == 'application/vnd.zip' || type == 'application/zip'){src_vignete = "/themes/immobilier/img/icon-file/icone-zip.png";}
	    else if(type == 'application/vnd.rar') { src_vignete = "/themes/immobilier/img/icon-file/icone-rar.png";}
	    else if(type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || type == 'application/vnd.oasis.opendocument.text'){src_vignete = "/themes/immobilier/img/icon-file/icone-word.png";}
	    else if(type == "video/mp4" || type == "video/webm" || type == "video/ogg"){src_vignete = '/themes/immobilier/img/icon-file/icone-video.jpg'}
	    return src_vignete;
	 }
		  	  
});
