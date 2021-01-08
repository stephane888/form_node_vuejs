<?php
namespace Drupal\form_node_vuejs;

/**
 *
 * @author stephane
 *
 */
class FormNodeVuejsTables{

	/**
	 * https://www.drupal.org/docs/7/api/schema-api/data-types
	 * @return string[][]|string[][][]|string[][][][]|boolean[][][][]|number[][][][]
	 */
	public static function form_node_vuejs_datasperfoms() {
		$schema=[];
		$schema['form_node_vuejs_datasperfoms'] = [
				'description' => 'contient les données permettant de suivre le processus de creation de nodes et les presavegardes',
				'fields' => [
						'id' => [
								'description' => 'The primary identifier for each item',
								'type' => 'serial',
								'unsigned' => TRUE,
								'not null' => TRUE,
						],
						'type' => [
								'description' => 'permet de categoriser les données',
								'type' => 'varchar',
								'length' => 255,
								'not null' => TRUE,
								'default' => '',
						],
						'datas' => [
								'description' => 'données utilisateur',
								'type' => 'text',
								'size' => 'normal',
								'not null' => FALSE,
						],
						'uid' => [
								'description' => 'identifiant utilisateur',
								'type' => 'int',
								'length' => 30,
								'not null' => TRUE,
								'default' => 0,
						],
				],
				'primary key' => ['id'],
		];
		return $schema;
	}
}