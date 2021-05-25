<?php
namespace Drupal\form_node_vuejs;

use Drupal\Component\Serialization\Json;

class FormNodeVuejsFormRender {

  /**
   * retourne le formulaire en json
   *
   * @param string $bundle
   * @return array
   */
  public function getDefinitionsNode(string $bundle)
  {
    $entity_type = 'node';

    //
    $defautForm = [];
    $entity_form_display = \Drupal::entityTypeManager()->getStorage('entity_form_display')->load('node.' . $bundle . '.default');
    if ($entity_form_display) {
      $defautForm = \Drupal::entityTypeManager()->getStorage('entity_form_display')
        ->load('node.' . $bundle . '.default')
        ->getComponents();
      // debugLog::logs( $defautForm, 'node.defautForm', 'kint0');
    }
    //
    $entityManager = \Drupal::service('entity_field.manager');
    $Allfields = $entityManager->getFieldDefinitions($entity_type, $bundle);
    // debugLog::logs( $Allfields, 'node_Allfields', 'kint');
    $fields = [];
    foreach ($Allfields as $key => $field) {
      if (! $field->isReadOnly()) {
        $defaults = $field->getDefaultValueLiteral();

        $fields[$key] = [
          'name' => $field->getName(),
          'type' => $field->getType(),
          'defaults' => $defaults,
          'require' => $field->isRequired(),
          // 'multiple'=>$field->isList(),
          'settings' => $field->getSettings(),
          'cardinality' => (method_exists($field, 'getFieldStorageDefinition')) ? $field->getFieldStorageDefinition()->getCardinality() : 1,
          'isbasefield' => (method_exists($field, 'isBaseField')) ? true : false,
          'label' => $field->getLabel(),
          'description' => $field->getDescription(),
          'custom_settings' => $this->getSetting('node_' . $bundle, $key)
        ];
        // add weight
        // if(isset($defautForm[$key]) && isset($defautForm[$key]['weight'])){$fields[$key]['weight']=$defautForm[$key]['weight'];}
        // add weight
        if (isset($defautForm[$key])) {
          $fields[$key]['weight'] = $defautForm[$key]['weight'];
          $fields[$key]['type_input'] = $defautForm[$key]['type'];
        }
        if (isset($fields[$key]['settings']['handler']) && $fields[$key]['settings']['handler'] == 'default:taxonomy_term') {
          $fields[$key]['options'] = $this->getListeTerm(reset($fields[$key]['settings']['handler_settings']['target_bundles']), "", 30);
        }
      }
      // remove field status if user is not have role admin
      // if (! $this->is_administrator) {
      // unset($fields['status']);
      // }
    }

    $config = \Drupal::config('wbujson.settings');
    $relationnode = $config->get('relationnode');
    if (! empty($relationnode)) {
      $relationnode = Json::decode($relationnode);
    }

    return [
      'fields' => $fields,
      'bundles_infos' => \Drupal::service("entity_type.bundle.info")->getAllBundleInfo()['node'],
      'relationnode' => $relationnode,
      'bundle'
    ];
  }

  /**
   *
   * @param
   *          $field_name
   */
  protected function getSetting($bundle, $field_name)
  {
    $config_get = \Drupal::config('form_node_vuejs.settings');
    $list_fields = $config_get->get($bundle . $field_name);
    $values = [];
    if ($list_fields) {
      foreach ($list_fields as $value) {
        $values[$value] = $config_get->get($bundle . $field_name . $value);
      }
    }
    return $values;
  }

  /**
   *
   * @param string $vocabulaire_name
   * @param string $search
   * @return NULL[]
   */
  protected function getListeTerm($vocabulaire_name, $search, $limit = 15)
  {
    $terms = [];
    $query = \Drupal::entityQuery('taxonomy_term');
    $query->condition('vid', $vocabulaire_name);
    $query->range(0, $limit);
    $query->sort('name', 'DESC');
    // $query->condition('field_1', "%" . $query->escapeLike($string) . "%", 'LIKE');
    if ($search != "" && $search != "<none>") {
      $query->condition('name', "%" . $search . "%", 'LIKE');
    }
    $tids = $query->execute();
    // /
    if (! empty($tids)) {
      $termes = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadMultiple($tids);
      foreach ($termes as $term) {
        $terms[$term->id()] = $term->getName();
      }
    }
    // \Drupal\debug_log\debugLog::logs( $terms[3], 'taxonomy_term', 'kint0');
    return $terms;
  }

  /**
   * Retourne les champs drupal.
   *
   * @param string $bundle
   * @return array
   */
  public function getFieldsMapper($bundle)
  {
    return $this->getDefinitionsNode($bundle);
    // $entity_type = 'node';
    // $entityManager = \Drupal::service('entity_field.manager');
    // return $entityManager->getFieldDefinitions($entity_type, $bundle);
  }
}
