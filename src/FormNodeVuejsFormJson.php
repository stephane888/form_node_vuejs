<?php

namespace Drupal\form_node_vuejs;

/**
 *
 * @author stephane
 *
 */
class FormNodeVuejsFormJson{

  protected $config_set = null;
  protected $config_get = null;
  /**
   *
   */
  public function __construct(){
    $this->config_set = \Drupal::service('config.factory')->getEditable('form_node_vuejs.settings');
    $this->config_get = \Drupal::config('form_node_vuejs.settings');
  }

  /**
   * Add select field
   * name=$group.$name
   */
  public function add_select($name, $group, $form, $options=[], $title='title', $default=''){
   // $value = $this->config_get;
    $value=$this->config_get->get($group.$name);
    $form[$group.$name] = [
      '#type' => 'select',
      '#title' => t($title),
      '#default_value' => (isset($value) && $value!='') ? $value : $default,
      '#options'=>$options,
    ];
    return $form;
  }

  /**
   * add textfield
   * $params = [
            'defaut'=>'',
            'condition'=>['visible'=>[':input[name='. $group.$name_parent .']' => ['value' => 'input_entity_reference_entity_autocomplete_popup']]]
          ];
   */
  public function add_textfield($name, $group, $form, $title='title', $params=[]){
    $value=$this->config_get->get($group.$name);
    // text
    if(!isset($params['default'])){$params['default']='';}
    $form[$group.$name] = [
      '#type' => 'textfield',
      '#title' => t($title),
      '#default_value' => (isset($value) && $value != NULL) ? $value : $params['default'],
    ];
    if( !empty($params['condition']) ){
      $form[$group.$name]['#states']=$params['condition'];
    }
    return $form;
  }

  /**
   * add textfield
   * $params = [
            'defaut'=>'',
            'condition'=>['visible'=>[':input[name='. $group.$name_parent .']' => ['value' => 'input_entity_reference_entity_autocomplete_popup']]]
          ];
   */
  public function add_checkbox($name, $group, $form, $title='Affiche ce block', $params=[]){
    $value=$this->config_get->get($group.$name);
    // text
    if(!isset($params['default'])){$params['default']=0;}
    $form[$group.$name] = [
      '#type' => 'checkbox',
      '#title' => t($title),
      '#default_value' => (isset($value)) ? $value : $params['default'],
    ];
    if( !empty($params['condition']) ){
      $form[$group.$name]['#states']=$params['condition'];
    }
    return $form;
  }


  public function saveform($values) {
    $admin = $this->defautValue();
    //dump($values);
    foreach ($values as $key=>$value){
      if(in_array($key, $admin)){
        continue;
      }
      $this->config_set->set($key, $value)->save();
    }
  }

  protected function defautValue() {
    return [
      'submit',
      'form_build_id',
      'form_token',
      'form_id',
      'op'
    ];
  }

  public function saveValue($key, $value){
    return $this->config_set->set($key, $value)->save();
  }

  public function getValue($param) {
    return $this->config_get->get($param);
  }


}






























