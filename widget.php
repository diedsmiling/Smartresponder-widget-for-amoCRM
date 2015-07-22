<?php
namespace smartresponder;

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

    }

    protected function endpoint_import()
    {

        $this->gatherPostData();
        $contacts = $this->getContacts();
        die('stop');

    }
    protected function gatherPostData(){
        $this->data['contactsIds'] = array();
        foreach($_POST['contacts'] as $contactId){
            $this->data['contactsIds'][] = (int)$contactId;
        }

        /* morder to come */
    }

    protected function getContacts(){
        return $this->contacts->get(array('id'=> $this->data['contactsIds']));
    }



}
