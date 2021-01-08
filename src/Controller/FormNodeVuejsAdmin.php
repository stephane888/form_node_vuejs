<?php

namespace Drupal\form_node_vuejs\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Component\Serialization\Json;
use Symfony\Component\DependencyInjection\ContainerInterface;

//
use Drupal\form_node_vuejs\FormNodeVuejs;

/**
 * Defines HelloController class.
 */
class FormNodeVuejsAdmin extends ControllerBase {
  /**
   *
   */
  public function ManageField(){
    $header = [
      '#type' => 'html_tag',
      '#tag' => 'h2',
      '#attributes' => [
        'class' => [],
      ],
      '#value'=>t('Select content type and customise fields'),
    ];
    $forms = \Drupal::formBuilder()->getForm('Drupal\form_node_vuejs\Form\FormNodeVuejsAdminManageField');
    return [$header, $forms];
  }
}