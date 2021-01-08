<?php

namespace Drupal\form_node_vuejs\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Database;
use Drupal\Component\Utility;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\debug_log\debugLog;
use Drupal\form_node_vuejs\FormNodeVuejsFormJson;
/**
 * Class ImmobilierGestionManageTicket.
 */
class FormNodeVuejsAdminManageField extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'Immobilier_coupon_add';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /**
     * get builder form
     */
    $_GenerateForm = new FormNodeVuejsFormJson();

    /**
     * Builder vertical menu
     */
    $vertical_tabs_group = 'form_node_vuejs_vertical_tabs';
    $form[$vertical_tabs_group] = array(
      '#type' => 'vertical_tabs',
      //'#default_tab' => 'edit-publication',
      '#weight' => -255,
      '#attributes'=>[
        'id'=>'form_node_vuejs-contents'
      ]
    );

    $entity_type='node';
    $contentTypes = \Drupal::entityTypeManager() ->getStorage('node_type')  ->loadMultiple();

   //dump($types);
    /**
     * Group Node
     * liste all nodes
     */
    foreach ($contentTypes as $contentType=>$infos) {
      $group = 'node_' . $contentType;
      $form[$group] = array(
        '#type' => 'details',
        '#title' => t($infos->label()),
        '#group' => $vertical_tabs_group,
      );
      $sous_group='fileds';
      $form[$group][$sous_group] = array(
        '#type' => 'details',
        '#title' => t('Champs'),
        '#open' => true,
        '#attributes' => [
          'class' => ['wbu-ui-state-default'],
        ],
      );
      $entityManager = \Drupal::service('entity_field.manager');
      $Allfields = $entityManager->getFieldDefinitions($entity_type, $contentType);
      $defaultForm = \Drupal::entityTypeManager()->getStorage('entity_form_display')->load('node.'.$contentType.'.default')->getComponents();
     // dump($Allfields[$field_name]->getLabel());
      /**
       * fileds
       */
      foreach ($defaultForm as $field_name=>$contentField) {
        /**
         * taxo : entity_reference_autocomplete
         */
        if($contentField['type']=='entity_reference_autocomplete' && 'uid' != $field_name){
          $list_fields=[];
          $form[$group][$sous_group][$field_name] = array(
            '#type' => 'details',
            '#title' => t( $Allfields[$field_name]->getLabel() ),
            '#open' => false,
          );

          /**
           * field  Selection du template
           */
          $options = [
            'entity_reference_entity_reference_autocomplete'=>'Selection simple avec autocomple',
            'entity_reference_entity_autocomplete_popup'=>'Selection avec popup',
            'entity_reference_select'=> 'Simple select',
            'entity_reference_select2'=> 'Selection avec recherche ',
          ];
          $name = $field_name.'template';
          $list_fields[]='template';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_select( $name, $group, $form[$group][$sous_group][$field_name][$group . $name], $options, 'Selection du template' );

          /**
           * Field  Titre de l'entete
           */
          $name = $field_name.'title';
          $list_fields[]='title';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $name_parent = $field_name.'template';
          $params = [
            'default'=>'',
            'condition'=>['visible'=>[':input[name='. $group.$name_parent .']' => ['value' => 'entity_reference_entity_autocomplete_popup']]]
          ];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_textfield($name, $group, $form[$group][$sous_group][$field_name][$group . $name], "Titre de l'entete", $params);

          /**
           * Field  text select
           */
          $name = $field_name.'textselect';
          $list_fields[]='textselect';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $params_2 = $params;
          $params_2['default']='Selectionner le terme';
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_textfield($name, $group, $form[$group][$sous_group][$field_name][$group . $name], "texte de selection", $params_2);
          /**
           * Field active presave terms
           */
          $name = $field_name.'proposeterme';
          $list_fields[]='proposeterme';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_checkbox( $name, $group, $form[$group][$sous_group][$field_name][$group . $name], "L'utilisateur peut proposer un terme", $params);

          /**
           * Field  Titre de creation du terme.
           */
          $name_parent = $field_name.'proposeterme';
          $params_2 = $params;
          $params_2['condition']['visible'][] = [':input[name='. $group.$name_parent .']' => ['checked' => TRUE]];
          $name = $field_name.'propose_title';
          $list_fields[]='proposeterme';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_textfield($name, $group, $form[$group][$sous_group][$field_name][$group . $name], "bloc propose:  Titre du bloc ", $params_2);

          /**
           * Field  Valeur de l'id term parent.
           */
          $name = $field_name.'propose_tid_parent';
          $list_fields[]='propose_tid_parent';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_textfield($name, $group, $form[$group][$sous_group][$field_name][$group . $name], "bloc propose: id term parent", $params_2);

          /**
           * Field active presave terms
           */
          $name = $field_name.'createterme';
          $list_fields[]='createterme';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_checkbox( $name, $group, $form[$group][$sous_group][$field_name][$group . $name], "L'utilisateur peut creer des termes", $params);

          /**
           * Field  Titre de creation du terme.
           */
          $name_parent = $field_name.'createterme';
          $params_2 = $params;
          $params_2['condition']['visible'][] = [':input[name='. $group.$name_parent .']' => ['checked' => TRUE]];
          $name = $field_name.'create_title';
          $list_fields[]='create_title';
          $form[$group][$sous_group][$field_name][$group . $name] = [];
          $form[$group][$sous_group][$field_name][$group . $name] = $_GenerateForm->add_textfield($name, $group, $form[$group][$sous_group][$field_name][$group . $name], "create terme: Titre du bloc ", $params_2);

          /**
           * Permet de retrouver la liste de champs.
           */
          $config_set = \Drupal::service('config.factory')->getEditable('form_node_vuejs.settings');
          $config_set->set($group . $field_name, $list_fields)->save();
        }
      }
    }


    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Appliqué'),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // execu result.
    $_GenerateForm = new FormNodeVuejsFormJson();
    $_GenerateForm->saveform($form_state->getValues());
  }
}