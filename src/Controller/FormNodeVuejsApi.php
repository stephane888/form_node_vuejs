<?php
namespace Drupal\form_node_vuejs\Controller;

use Drupal\form_node_vuejs\FormNodeVuejsFormRender;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Component\Serialization\Json;

class FormNodeVuejsApi {

  public function getForm($bundle)
  {
    $FormNodeVuejsFormRender = new FormNodeVuejsFormRender();
    $configs = $FormNodeVuejsFormRender->getDefinitionsNode($bundle);
    $configs = Json::encode($configs);
    $reponse = new JsonResponse();
    $reponse->setContent($configs);
    return $reponse;
  }
}