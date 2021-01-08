<?php
namespace Drupal\form_node_vuejs\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Component\Serialization\Json;
use Drupal\form_node_vuejs\Controller\FormNodeVuejsAccess;
use Drupal\Core\Database\Database;
use Drupal\debug_log\debugLog;
use Drupal\node\Entity\Node;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "node_rest_resource",
 *   label = @Translation("Form node vuejs"),
 *   uri_paths = {
 *     "canonical" = "/api/form-node/{action}/{id}",
 *     "create" = "/api/form-node/create/{action}"
 *   }
 * )
 */
class NodeRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   */
  protected $permission = null;

  /**
   */
  protected $access = true;

  /**
   */
  protected $message_access = '';

  /**
   *
   * @var integer
   */
  protected $is_administrator = TRUE;

  protected $code_access_error = 403;

  protected $request;

  /**
   * Constructs a new NodeRestResource object.
   *
   * @param array $configuration
   *          A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *          The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *          The plugin implementation definition.
   * @param array $serializer_formats
   *          The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *          A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *          A current user instance.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger, AccountProxyInterface $current_user)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
  }

  /**
   *
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
  {
    return new static($configuration, $plugin_id, $plugin_definition, $container->getParameter('serializer.formats'), $container->get('logger.factory')->get('form_node_vuejs'), $container->get('current_user'));
  }

  /**
   * Responds to GET requests.
   *
   * @param object $request
   *          - generate-form/bundle use to generate form for current bundle
   * @param string $action
   *          ' form=> renvoit les champs du formulaire en question '
   * @param string $id
   *          ' bundle for node, or '
   *          
   * @return \Drupal\rest\ResourceResponse The HTTP response object.
   *        
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException Throws exception expected.
   */
  public function get($action, $id, Request $request)
  {
    return $this->getTestData();
    $result = [];
    $this->request = $request;
    // debugLog::logs( [], 'server_request_headers', 'kint0' );
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    /*
     * if (!$this->currentUser->hasPermission('access content')) {
     * throw new AccessDeniedHttpException();
     * }
     */

    // identifie if user is admininstrator
    if (! in_array('administrator', $this->currentUser->getRoles())) {
      $this->is_administrator = FALSE;
    }

    // custom permission
    $this->permission = new FormNodeVuejsAccess();
    if (! $this->permission->readDatas($this->currentUser)->isAllowed()) {
      return new ResourceResponse('vous n\'avez pas les droits suffisant pour acceder à cette ressources ', 401);
    }

    if ($action == 'generate-form') {
      $result = $this->getDefinitionsNode($id);
    } elseif ($action == 'edit-form') {
      $result = $this->getNode($id);
    } elseif ($action == 'filter-taxonomy-term') {
      // debugLog::logs( $request->headers->get('x-csrf-research'), 'server_request_headers', 'kint', false );
      $result = $this->getListeTerm($id, $request->headers->get('x-csrf-research'));
    } elseif ($action == 'filter-taxonomy-term-popup') {
      // debugLog::logs( $request->headers, $id, 'kint', false );
      $result = $this->getListeTermPopup($id, $request->headers->get('x-csrf-research'));
    }
    if (! $this->access) {
      return new ResourceResponse($this->message_access, $this->code_access_error);
    }
    $response = new ResourceResponse($result, 200);
    $response->addCacheableDependency($result);
    return $response;
  }

  protected function getTestData()
  {
    $result = [];
    $response = new ResourceResponse($result, 200);
    $response->addCacheableDependency($result);
    return $response;
  }

  /**
   * Responds to PUT requests.
   *
   * @param string $payload
   *
   * @return \Drupal\rest\ModifiedResourceResponse The HTTP response object.
   *        
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException Throws exception expected.
   */
  public function put($payload)
  {
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (! $this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    return new ModifiedResourceResponse($payload, 201);
  }

  /**
   * Responds to POST requests.
   *
   * @param string $payload
   *
   * @return \Drupal\rest\ModifiedResourceResponse The HTTP response object.
   *        
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException Throws exception expected.
   *         form-node
   */
  public function post($action, $payload)
  {
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (! $this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    if ($action == 'node') {
      if (isset($payload['type'])) {
        if ($payload['type'] == 'add_term') {
          $this->save_custom_datas($payload);
        } elseif (is_array([
          'type'
        ])) {
          $node_info = reset($payload['type']);
          if (! empty($node_info['target_id']) && ! empty($node_info['target_type'])) {
            $fields = $this->getDefinitionsNode($node_info['target_id']);
            $payload = $this->valideValue($payload, $fields['fields']);
            $node = Node::create($payload);
            $node->save();
            // $payload = ['node'=>$payload];
            $payload['nid'][] = [
              'value' => $node->id()
            ];
          } else {
            $this->error_save($payload);
            return new ResourceResponse("Nous sommes désolés mais une erreur s'est produite, Notre equipe de maintenance vous contactera dés que le probleme serra resolu.", 503, [
              'x-csrf-custom-error' => 'custom message'
            ]);
          }
        }
      }
    } elseif ($action == 'terms') {
      $payload = $this->createTerms($payload);
    }

    return new ModifiedResourceResponse($payload, 200);
  }

  protected function valideValue($payload, $fields)
  {
    foreach ($payload as $fieldname => $value) {
      if ($fieldname == 'type' || $fieldname == 'nid') {
        continue;
      } else {
        /**
         * on verifie la cardinalité
         */
        if (count($value) > $fields[$fieldname]['cardinality']) {
          $validValue = [];
          for ($i = 0; $i < $fields[$fieldname]['cardinality']; $i ++) {
            $validValue[$i] = $value[$i];
          }
          $value = $validValue;
          $payload[$fieldname] = $value;
        }
        /**
         * On verifie le type
         */
        $payload[$fieldname] = $this->valideType($fields[$fieldname]['type_input'], $value);
      /**
       * On limite le nombre de caractaire, ( JS cest mieux )
       */
      }
    }
    return $payload;
  }

  /**
   */
  protected function valideType($typeData, $value)
  {
    $validValue = [];
    if ($typeData == 'string_textfield') {
      foreach ($value as $val) {
        $validValue[] = [
          'value' => \Drupal\Component\Utility\Html::escape($val['value'])
        ];
      }
      return $validValue;
    } elseif ($typeData == 'number') {
      $max_value = 99999999;
      foreach ($value as $val) {
        if ($val['value'] != '') {
          $string = str_replace(' ', '', $val['value']);
          $string = str_replace('.', '', $string);
          $string = str_replace(',', '', $string);
          $string = intval($string);
          if ($string > $max_value) {
            $string = $string - $max_value;
          }
          $validValue[] = [
            'value' => $string
          ];
        }
      }
      return $validValue;
    }
    return $value;
  }

  /**
   *
   * @paramarray $payload
   */
  protected function createTerms($payload)
  {
    $term = \Drupal\taxonomy\Entity\Term::create($payload);
    $term->save();
    return [
      'tid' => $term->id(),
      'name' => $term->label()
    ];
  }

  /**
   *
   * @param array $payload
   */
  protected function save_custom_datas($payload)
  {
    $table = 'form_node_vuejs_datasperfoms';
    $fields = [
      'type' => $payload['type'],
      'datas' => json_encode($payload['datas']),
      'uid' => $this->currentUser->id()
    ];
    Database::getConnection()->insert($table)
      ->fields($fields)
      ->execute();
  }

  /**
   *
   * @param array $payload
   */
  protected function error_save($payload)
  {
    $errors = [
      'type' => 'error',
      'datas' => $payload
    ];
    $this->save_custom_datas($errors);
  }

  /**
   *
   * @param string $bundle
   * @return array[]|NULL[]|mixed[]|boolean[][][]|string[][][]|NULL[][][]|number[][][]|array[]|\Drupal\Component\Render\MarkupInterface[]|string[]|array[][]|array[][]
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
      if (! $this->is_administrator) {
        unset($fields['status']);
      }
    }

    $config = \Drupal::config('wbujson.settings');
    $relationnode = $config->get('relationnode');
    if (! empty($relationnode)) {
      $relationnode = Json::decode($relationnode);
    }
    return [
      'fields' => $fields,
      'bundles_infos' => \Drupal::service("entity_type.bundle.info")->getAllBundleInfo()['node'],
      'relationnode' => $relationnode
    ];
  }

  /**
   *
   * @param int $nid
   * @return array []|string[]|NULL[]|mixed[]|array[]|\Drupal\Component\Render\MarkupInterface[]|array[][]|array[][]
   */
  protected function getNode(int $nid)
  {
    $fields = [];
    $image_style = 'thumbnail';
    $node = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
    // debugLog::logs( $node->getOwnerId(), 'node_getOwnerId', 'kint0');
    // \Drupal\debug_log\debugLog::logs( $node->getFields()["title"]->getSettings(), 'getFields_title_getSettings', 'kint0');
    if (! $node) {
      $this->access = false;
      $this->message_access = 'Ce contenu n\'existe pas ou a été supprimé ';
      $this->code_access_error = 403;
      return false;
    }
    if ($node->getOwnerId() != $this->currentUser->id()) {
      $this->access = false;
      $this->message_access = 'Vous n\'avez pas les access, bien vouloir contactez l\'administrateur';
      $this->code_access_error = 403;
      return false;
    }

    $defautForm = \Drupal::entityTypeManager()->getStorage('entity_form_display')
      ->load('node.' . $node->bundle() . '.default')
      ->getComponents();
    // debugLog::logs( $node->getFields()['field_etage']->getFieldDefinition(), 'node_getFields_field_etage_getFieldDefinition', 'kint0');
    foreach ($node->getFields() as $key => $field) {
      $fields[$key] = [
        'name' => $field->getFieldDefinition()->getName(),
        'type' => $field->getFieldDefinition()->getType(),
        'defaults' => $field->getFieldDefinition()->getDefaultValueLiteral(),
        'require' => $field->getFieldDefinition()->isRequired(),
        // 'multiple'=>$field->getFieldDefinition()->isList(),
        'settings' => $field->getFieldDefinition()->getSettings(),
        'label' => $field->getFieldDefinition()->getLabel(),
        'cardinality' => (method_exists($field->getFieldDefinition(), 'getFieldStorageDefinition')) ? $field->getFieldDefinition()
          ->getFieldStorageDefinition()
          ->getCardinality() : 1,
        'isbasefield' => (method_exists($field->getFieldDefinition(), 'isBaseField')) ? true : false,
        'valeur' => $field->getValue(),
        'description' => (method_exists($field->getFieldDefinition(), 'getDescription')) ? $field->getFieldDefinition()->getDescription() : false,
        'custom_settings' => $this->getSetting('node_' . $node->bundle(), $key)
      ];
      // add weight
      if (isset($defautForm[$key])) {
        $fields[$key]['weight'] = $defautForm[$key]['weight'];
        $fields[$key]['type_input'] = $defautForm[$key]['type'];
        if (isset($fields[$key]['settings']['handler']) && $fields[$key]['settings']['handler'] == 'default:taxonomy_term') {
          $fields[$key]['options'] = $this->getListeTerm(reset($fields[$key]['settings']['handler_settings']['target_bundles']), "", 30);
        }
      }
    }
    // get additionnal infos
    foreach ($fields as $k => $f) {
      // get valeur title for entity type node
      if (isset($f['settings']['handler']) && $f['settings']['handler'] == "default:node" && ! empty($f['valeur'])) {
        $new_entity = \Drupal::entityTypeManager()->getStorage('node')->load($f['valeur'][0]['target_id']);
        $fields[$k]['infosplus'] = [
          'title' => $new_entity->getTitle()
        ];
        // get term name
      } elseif (isset($f['settings']['handler']) && $f['settings']['handler'] == "default:taxonomy_term" && ! empty($f['valeur'])) {
        $new_entity = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($f['valeur'][0]['target_id']);
        $fields[$k]['infosplus'] = [
          'title' => $new_entity->getName()
        ];
      } // get file uri
      elseif (isset($f['settings']['handler']) && $f['settings']['handler'] == "default:file" && ! empty($f['valeur'])) {
        // image
        $hrefs = [];
        if ($f['settings']['default_image']) {
          foreach ($f['valeur'] as $image) {
            $file = \Drupal\file\Entity\File::load($image['target_id']);
            // \Drupal\debug_log\debugLog::logs( $file, 'image', 'kint0');
            if ($file) {
              $hrefs[] = [
                'href' => \Drupal\image\Entity\ImageStyle::load($image_style)->buildUrl($file->getFileUri())
              ];
            }
          }
        } else {
          foreach ($f['valeur'] as $image) {
            $file = \Drupal\file\Entity\File::load($image['target_id']);
            // \Drupal\debug_log\debugLog::logs( $file->url(), 'file-url', 'kint0');
            if ($file) {
              $hrefs[] = [
                'href' => $file->url(),
                'name' => $file->getFilename(),
                'minetype' => $file->getMimeType()
              ];
            }
          }
        }
        $fields[$k]['infosplus'] = $hrefs;
      }
    }
    $fields['uid']['valeur'][0]['value'] = $node->getRevisionAuthor()->getUsername();
    //
    if (! $this->is_administrator) {
      unset($fields['status']);
      $fields['uid']['is_admin'] = FALSE;
    } else {
      $fields['uid']['is_admin'] = TRUE;
    }

    $config = \Drupal::config('wbujson.settings');
    $relationnode = $config->get('relationnode');
    if (! empty($relationnode)) {
      $relationnode = Json::decode($relationnode);
    }
    return [
      'fields' => $fields,
      'bundle' => $node->bundle(),
      'bundles_infos' => \Drupal::service("entity_type.bundle.info")->getAllBundleInfo()['node'],
      'relationnode' => $relationnode
    ];
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
   *
   * @param string $vocabulaire_name
   * @param string $search
   * @param number $limit
   */
  protected function getListeTermPopup($vocabulaire_name, $search, $limit = 24)
  {
    $request = $this->request;
    $terms = [];
    $parent_target_id = $request->headers->get('x-csrf-parent-target-id');
    // debugLog::logs( [$request->headers, $parent_target_id], 'server_header', 'kint0', false );
    if ($parent_target_id != null) {
      $limit = 200;
      $query = Database::getConnection()->select('taxonomy_term_field_data', 'ter');
      $query->innerJoin('taxonomy_term__parent', 'p_ter', 'p_ter.entity_id = ter.tid');
      $query->fields('ter', [
        'tid'
      ]);
      $query->condition('p_ter.parent_target_id', $parent_target_id);
      $query->condition('vid', $vocabulaire_name);
      $query->range(0, $limit);
      $query->orderBy('name', 'ASC');
      $tids = $query->execute()->fetchAll();
      if (! empty($tids)) {
        foreach ($tids as $tid) {
          $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($tid->tid);
          $terms[] = [
            'label' => $term->getName(),
            'id' => $term->id()
          ];
        }
      }
      /*
       * $query = \Drupal::entityQuery('taxonomy_term');
       * $query->condition('vid', $vocabulaire_name);
       * $query->condition('parent_target_id', $parent_target_id);
       * $query->range(0, $limit);
       * $query->sort('name','ASC');
       * $tids = $query->execute();
       * ///
       * if(!empty($tids)){
       * $termes = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadMultiple($tids);
       * foreach ($termes as $term){
       * $terms[]=[
       * 'label'=>$term->getName(),
       * 'id'=>$term->id(),
       * ];
       * }
       * }
       */
      // debugLog::logs( [$request->headers, $parent_target_id, $terms], 'server_header', 'kint0', false );
      return $terms;
    }
    $query = \Drupal::entityQuery('taxonomy_term');
    $query->condition('vid', $vocabulaire_name);
    $query->range(0, $limit);
    $query->sort('name', 'ASC');
    // $query->condition('field_1', "%" . $query->escapeLike($string) . "%", 'LIKE');
    if ($search != "" && $search != "<none>") {
      $query->condition('name', "%" . $search . "%", 'LIKE');
    }
    $tids = $query->execute();
    // /
    if (! empty($tids)) {
      $termes = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadMultiple($tids);
      foreach ($termes as $term) {
        $terms[] = [
          'label' => $term->getName(),
          'id' => $term->id()
        ];
      }
    }
    // debugLog::logs( [$request->headers, $parent_target_id, $terms], 'server_header', 'kint0', false );
    return $terms;
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
}









































































