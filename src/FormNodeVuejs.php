<?php
namespace Drupal\form_node_vuejs;

use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;
use ScssPhp\ScssPhp\Compiler;

class FormNodeVuejs {

  const ModeDebug = true;

  /**
   */
  public static function geturlimage($fids, $style = 'thumbnail')
  {
    if (is_array($fids)) {
      $images_url = []; // \Drupal\debug_log\debugLog::logs( $fids , 'debug', 'kint0' );
      foreach ($fids as $fid) {
        if ($fid['target_id']) {
          $file = File::load($fid['target_id']);
          if ($file) {
            $images_url[] = ImageStyle::load($style)->buildUrl($file->getFileUri());
          }
        }
      }
      return $images_url;
    } else {}
    return false;
  }

  public static function setTitle($title)
  {
    // set title => https://drupal.stackexchange.com/questions/181828/how-do-i-set-the-page-title
    $request = \Drupal::request();
    if ($route = $request->attributes->get(\Symfony\Cmf\Component\Routing\RouteObjectInterface::ROUTE_OBJECT)) {
      $route->setDefault('_title', $title);
    }
  }

  public static function getTitle()
  {
    // set title => https://drupal.stackexchange.com/questions/181828/how-do-i-set-the-page-title
    $request = \Drupal::request();
    if ($route = $request->attributes->get(\Symfony\Cmf\Component\Routing\RouteObjectInterface::ROUTE_OBJECT)) {
      return \Drupal::service('title_resolver')->getTitle($request, $route);
    }
    return false;
  }

  public static function buildScss()
  {
    if (! self::ModeDebug) {
      return false;
    }
    $path_module = drupal_get_path('module', 'form_node_vuejs');
    // convert bootstrap scss to css
    $parser = new Compiler();

    // build custom style
    $result = $parser->compile('@import "' . DRUPAL_ROOT . '/' . $path_module . '/scss/style.scss";');
    $filename = DRUPAL_ROOT . '/' . $path_module . '/css/style.css';
    $monfichier = fopen($filename, 'w+');
    fputs($monfichier, $result);
    fclose($monfichier);
  }
}

