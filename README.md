# Base64ToS3Converter

## Description
The base64tos3-converter repository has a single lambda which takes base64 and a mimetype and puts the document into S3

This repo is failover ready VIA DNS

The repository contains:
* An API Gateway for communicating with the function
* A lambda & associated permissions connected to the api gateway

## Deployment
### Initial Deployment
* Create a bucket named in the following format in each deployment region `SHERPA_NAME-deployment-bucket-AWS_REGION`
* Create a SSM parameter with the alias `/base64tos3converter/apikey` as a SecureString and generate an API key
* Follow the steps in the all deployments section

### All Deployments
* Create a zip of the src and upload it to the deployment buckets including the version number. The zip should be named as follows: `base64tos3converter-VERSION.zip`
  * `npm run zip` will automatically append the current package.json version to the zip created
  * Please be good souls and bump the version if you are actively working on this. A previous .zip file will allow us rollback if we ever need too.
* In each deployment region use the update stack (create if doing for the first time) behaviour and create/update the stack named `base64tos3converter`
* The stack parameters should be filled in as follows:
  * Version: The version number of the service that matches the zip in the deployment bucket
  * ApiKeySSMParameter: The SSM parameter containing the API key.
  * SherpaName: The name of the sherpa (this is usually the organization name but the parameter is not called organization as sherpas can contain multiple organizations)
  * AcmCertArn: The ARN of the ACM certificate to use
  * CustomDomainName: The custom domain name associated with the ACM certificate to be used

## API
### Base64 to S3

| Summary | |
| - | - |
| Description | Converts XML to JSON |
| Endpoint | `/v1/base64tos3` |
| Verb | POST |

#### Request Headers

| Key | Value |
| - | - |
| Content-Type | application/json |
| Authorization | ApiKey {some-api-key} |

#### Request Body

```json
{
  "base64":"BASE_64_STRING",
  "mimeType":"mimeType" // application/pdf & image/tiff supported
}
```

#### Response Headers

| Key | Value |
| - | - |
| Content-Type | application/json |

#### Responses

| Status Code | Description |
| - | - |
| 200 | Success - Successfully created the file in S3 |
| 400 | Invalid request -  Body will contain a descriptive error message. |
| 500 | Internal Server Error. |

#### Response Body
```json
{
    "presignedUrl": "S3URL"
}
```
