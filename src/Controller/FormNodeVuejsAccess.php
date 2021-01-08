<?php

namespace Drupal\form_node_vuejs\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Session\AccountProxyInterface;


/**
 * Defines FormNodeVuejs class.
 */
class FormNodeVuejsAccess {

  /**
   *
   * @param AccountProxyInterface $current_user
   * @return \Drupal\Core\Access\AccessResult
   */
  public function readDatas(AccountProxyInterface $current_user){
    //\Drupal\debug_log\debugLog::logs( $current_user, 'currentUser', 'kint0' );
    //\Drupal\debug_log\debugLog::logs( $current_user->hasPermission('wbujson write'), 'currentUser_wbujson_write', 'kint0' );
    //return AccessResult::forbidden();
    //return AccessResult::allowed();
    return AccessResult::allowedIfHasPermission($current_user, 'form_node_vuejs read');
  }
  /**
   *
   * @param AccountProxyInterface $current_user
   * @return \Drupal\Core\Access\AccessResult
   */
  public function writeDatas(AccountProxyInterface $current_user){
    //\Drupal\debug_log\debugLog::logs( $current_user, 'currentUser', 'kint0' );
    //\Drupal\debug_log\debugLog::logs( $current_user->hasPermission('wbujson write'), 'currentUser_wbujson_write', 'kint0' );
    //return AccessResult::forbidden();
    //return AccessResult::allowed();
    return AccessResult::allowedIfHasPermission($current_user, 'form_node_vuejs write');
  }

  /**
   *
   * @param AccountProxyInterface $current_user
   * @return \Drupal\Core\Access\AccessResult
   */
  public function AdminDatas(AccountProxyInterface $current_user){
    return AccessResult::allowedIfHasPermission($current_user, 'form_node_vuejs admin');
  }
}