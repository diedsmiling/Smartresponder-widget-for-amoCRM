<?php
namespace sr_export;

/**
 * Class Widget
 * example widget class
 */
class Widget extends \Helpers\Widgets
{
    private $data;

    private $securityKey = 'Sjlsjkl12AJDjk23jAdh123uhAw12s88';
    /**
     * Throw exception
     * @param \Exception $E
     */
    public static function ExceptionHandler(\Exception $E) {
        \Helpers\Debug::vars(\Helpers\I18n::get('exceptions.error').': '.$E->getMessage());

    }

    /**
     * Endpoint for import
     */
    protected function endpoint_import() {
        $importData = $this->gatherData();
        $res = $this->sendRequest('http://smartresponder.ru/api/import.html', $importData);
        $xmlResult = simplexml_load_string(trim($res)); //Import api response only in xml, json not supported :(
        $result = json_encode($xmlResult);
        echo $result;
        die();
    }

    /**
     * Endpoint for count
     */
    protected function endpoint_count() {
        $ids = array();
        foreach($_POST['contacts'] as $contactId){
            $ids[] = (int)$contactId;
        }
        $emails = array();
        if(!empty($ids))
            $contacts = $this->contacts->get(array('id'=> $ids));
        $emails = $this->getEmailsFromContacts($contacts);
        $res = array('amount'=>sizeof($emails));
        $result = json_encode($res);
        echo $result;
        die();
    }

    /**
     * Gets array of concatenated email and contact name
     * @param $contacts
     * @return array
     */
    private function getEmailsFromContacts($contacts) {
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
        return $concatenatedContactsData;
    }

    /**
     * Endpoint for watching import state
     */
    protected function endpoint_watch() {
        $apiKey = addslashes($_POST['api_key']);
        $importKey = addslashes($_POST['import_key']);

        $importData = array();
        $importData['service_key'] = $this->securityKey;
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

    /**
     * Send curl request
     * @param $link
     * @param $data
     * @return mixed
     */
    protected function sendRequest($link, $data) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $link);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        return curl_exec($ch);
    }

    /**
     * Output error message
     * @param $error
     */
    protected function callError($error) {
        echo json_encode(array(
            'error'=>1,
            'message'=> $error
        ));
        die();
    }

    /**
     * Gather and organize data for request
     * @return array
     */
    protected function gatherData() {
        $importData = array();
        /* if sent id`s not, emails */
        $idsSent = (int)$_POST['sending_ids'];
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

        /* Concatenate contacts email & name in one string */
        $concatenatedContactsData = array();
        if ($idsSent == 0) {
            $concatenatedContactsData[] = addslashes($_POST['contacts'][0]) . ';' . addslashes($_POST['contact_name'] . ';;;;;;;;;;');
        } else {
            $contacts = $this->contacts->get(array('id'=> $ids));
            if(!empty($contacts)) {
                $concatenatedContactsData = $this->getEmailsFromContacts($contacts);
            }
        }
        $importData['api_key'] = $apiKey;
        $importData['format'] = 'xml';
        $importData['action'] = 'import';
        $importData['service_key'] = $this->securityKey;
        $importData['email_source'] = 'otherservice';
        $importData['details'] = \Helpers\I18n::get('import_data.details');
        $importData['destination'] = implode(',', $destinations);
        $importData['description'] = \Helpers\I18n::get('import_data.details');
        $importData['charset'] = 'utf-8';
        $importData['input_data'] = implode("\n", $concatenatedContactsData);
        return $importData;
    }

}
