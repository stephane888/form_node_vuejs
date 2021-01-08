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
class FormNodeVuejsDefault extends ControllerBase {

	protected $immobilierGestionAnnonceur;


  /**
   *
   */
  public function addnode($bundle){
  	FormNodeVuejs::buildScss();
  	$status = [
  	  'status'=>true,
  	  'msg'=>'module en cours',
  	];
    return [
      '#theme' => 'form_node_vuejs_node',
    	'#bundle'=>$bundle,
    	'#action'=>'add',
    		'#status'=>$status,
      '#attached' => array(
      		'library' => ['form_node_vuejs/default','form_node_vuejs/addnode'],
        'drupalSettings' => [
        		'form_node_vuejs' => ['contentType' => $bundle,]
        ]
      )
    ];
  }

  public function updatenode($id){
  	FormNodeVuejs::buildScss();
  	$status = [
  	  'status'=>true,
  	  'msg'=>'module en cours',
  	];
  	return [
  			'#theme' => 'form_node_vuejs_node',
  			'#bundle'=>$id,
  			'#action'=>'edit',
  			'#status'=>$status,
  			'#attached' => array(
  					'library' => ['form_node_vuejs/default','form_node_vuejs/editnode'],
  					'drupalSettings' => [
  							'form_node_vuejs' => ['nid' => $id,]
  					]
  			)
  	];
  }
}

