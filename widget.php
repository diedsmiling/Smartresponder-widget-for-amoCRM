<?php
namespace test;
defined('LIB_ROOT') or die();
/**
 * Class Widget
 * example widget class
 */
class Widget extends \Helpers\Widgets
{
    private $data;

    public static function ExceptionHandler(\Exception $E)
    {
        \Helpers\Debug::vars(\Helpers\I18n::get('exceptions.error').': '.$E->getMessage());
        die;
    }

    protected function endpoint_get()
    {
        die('a');
        /*
        if(1 == 0)
            throw new \Exception(\Helpers\I18n::get('exceptions.user_already_exists'));
        */
    }

}
