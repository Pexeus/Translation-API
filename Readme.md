
# Usage

  

This API endpoint allows users to translate text from one language to another sequentially using a translation queue.

  

### Endpoint

  

`GET /translate/:from/:to/:text`

  

### Parameters

  

- `from`: The source language code.

- `to`: The target language code.

- `text`: The text to be translated.

  
  

### Example

  

 - **Request:** `http://localhost/translate/en/fr/hello this is a test`
 - **Response:** `Bonjour c'est un test`
