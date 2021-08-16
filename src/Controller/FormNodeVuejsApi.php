<?php

namespace Drupal\form_node_vuejs\Controller;

use Drupal\form_node_vuejs\FormNodeVuejsFormRender;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Component\Serialization\Json;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;

class FormNodeVuejsApi extends ControllerBase {
	protected $TaxonomyTermTree;
	protected $EntityTypeManager;
	
	/**
	 *
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container){
		return new static( $container->get( 'taxonomy_tree.taxonomy_term_tree' ) );
	}
	public function getForm($bundle){
		$FormNodeVuejsFormRender = new FormNodeVuejsFormRender();
		$configs = $FormNodeVuejsFormRender->getDefinitionsNode( $bundle );
		$configs = Json::encode( $configs );
		$reponse = new JsonResponse();
		$reponse->setContent( $configs );
		return $reponse;
	}
	public function getTerms($vid, Request $Request){ // action
		if($Request->getMethod() === 'GET'){
			$action = $Request->query->get( 'action' );
			if($action === 'mapping'){
				//
			}
		}
		$configs = \Drupal::service( 'entity_type.manager' )->getStorage( "taxonomy_term" )
			->loadTree( $vid, $parent = 0, $max_depth = NULL, $load_entities = FALSE );
		
		$reponse = new JsonResponse();
		$reponse->setContent( Json::encode( $configs ) );
		return $reponse;
	}
}