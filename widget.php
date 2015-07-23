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
        $importData = $this->gatherData();
        $res = $this->sendRequest('http://smartresponder.ru/api/import.html', $importData);
        $xmlResult = simplexml_load_string(trim($res)); //Import api response only in xml, json not supported :(
        $result = json_encode($xmlResult);
        echo $result;
        die();
    }

    protected function endpoint_watch(){
        $apiKey = addslashes($_POST['api_key']);
        $importKey = addslashes($_POST['import_key']);

        $importData = array();
        $importData['service_key'] = SR_SECURITY_KEY;
        $importData['format'] = 'xml';
        $importData['import_key'] = $importKey;
        $importData['action'] = 'result';
        $importData['api_key'] = $apiKey;
        $res = $this->sendRequest('http://smartresponder.ru/api/import.html', $importData);
        $xmlResult = simplexml_load_string(trim($res)); //Import api response only in xml, json not supported :(
        $result = json_encode($xmlResult);
        echo $result;
        die();
    }

    protected function sendRequest($link, $data) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $link);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        return curl_exec($ch);
    }

    protected function callError($error) {
        echo json_encode(array(
            'error'=>1,
            'message'=> $error
        ));
        die();
    }

    protected function gatherData(){
        $importData = array();
        /* get api key */
        $apiKey = addslashes($_POST['api_key']);

        /* get contacts data */
        $ids = array();
        foreach($_POST['contacts'] as $contactId){
            $ids[] = (int)$contactId;
        }

        /* destinations */
        $destinations = array();
        $deliveryDestination = (int)$_POST['delivery_destination'];
        $groupDestination = (int)$_POST['group_destination'];

        if($deliveryDestination > 0)
            $destinations[] = 'd:'.$deliveryDestination;
        if($groupDestination > 0)
            $destinations[] = 'g:'.$groupDestination;

        if(empty($destinations)) {
            $this->callError(\Helpers\I18n::get('errors.null_destination'));
        }


        $contacts = $this->contacts->get(array('id'=> $ids));

        /* Concatenate contacts email & name in one string */
        $concatenatedContactsData = array();
        if(!empty($contacts)) {
            foreach($contacts as $contact) {
                if(!empty($contact['custom_fields'])) {
                    foreach($contact['custom_fields'] as $field) {
                        if($field['code'] == 'EMAIL' && !empty($field['values'])){
                            foreach ($field['values'] as $email) {
                                $concatenatedContactsData[] = addslashes($email['value']).';'.addslashes($contact['name'].';;;;;;;;;;');
                            }
                        }
                    }
                }
            }
        }
        $importData['api_key'] = $apiKey;
        $importData['format'] = 'xml';
        $importData['action'] = 'import';
        $importData['service_key'] = SR_SECURITY_KEY;
        $importData['email_source'] = 'otherservice';
        $importData['details'] = \Helpers\I18n::get('import_data.details');
        $importData['destination'] = implode(',', $destinations);
        $importData['description'] = \Helpers\I18n::get('import_data.details');
        $importData['charset'] = 'utf-8';
        $importData['input_data'] = implode("\n", $concatenatedContactsData);
        return $importData;
    }

    protected function getContacts(){
        return $this->contacts->get(array('id'=> $this->data['contactsIds']));
    }



}
