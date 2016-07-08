**Start Simulation**
----
  Returns the job id of the simulation

* **URL**

  /SimulationControl/?command=start

* **Method:**

  `POST`
  
*  **URL Params**

   None

* **Data Params**

  **Required:**
  
  **Sample**
  ```
    {
      config: {
      "run":2,
      "agents":200,
      "building":"SUNTEC-EXH",
      "location":"601-602",
      "time":"15:05",
      "crowd":"RANDOM",
      "information":"PARTIAL",
      "path":"ADAPTIVE",
      "activatedLift":[
            "Lift 2 @ Floor 0",
            "Lift 4 @ Floor 0",
            "Lift 5 @ Floor 0",
            "Lift 6 @ Floor 0"
            ],
      "activatedEscalator":[
          "Stair id 0 @ level 0",
          "Stair id 1 @ level 0",
          "Stair id 2 @ level 0",
          "Stair id 0 @ level 2",
          "Stair id 1 @ level 2",
          "Stair id 2 @ level 2",
          "Stair id 3 @ level 2",
          "Stair id 4 @ level 2",
          "Stair id 5 @ level 2",
          "Stair id 6 @ level 2"
          ],
      "activatedAccess":[
          "Door 0 @ Floor 0"
          ]
      }
    }
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"message":"Batch Mode Complete. Batch ID: <id>"}`

 **Get All Simulation Results**
----
  Returns an array of simulation results

* **URL**

  /SimulationControl/?command=getAllBatchRunData

* **Method:**

  `GET`
  
*  **URL Params**

   None

* **Data Params**

  **Required:** 
  None

* **Success Response:**

  * **Code:** 200 
  
    **Content:** 
    ```
    [
      {
        "batchId": "1467884877675",
        "runs": 1,
        "batch": [
          {
            "instanceId": "277628412",
            "instanceState": "FINISHED",
            "instanceProcessId": "11600",
            "jobId": "1467883665188",
            "result": "{\"interval\":5,\"results\":[195.4,252.6,262.8,303.4,316.8,334.6,350.8,364.4,379.0,382.4,396.6,416.6,421.8,438.6,451.0,469.4,480.0,504.6,517.0,601.0]}",
            "parameter": "{\"run\":1,\"agents\":100,\"building\":\"SUNTEC-EXH\",\"location\":\"601-602\",\"time\":\"15:05\",\"crowd\":\"RANDOM\",\"information\":\"PARTIAL\",\"path\":\"ADAPTIVE\",\"activatedLift\":[\"Lift 2 @ Floor 0\",\"Lift 3 @ Floor 0\",\"Lift 4 @ Floor 0\",\"Lift 5 @ Floor 0\",\"Lift 6 @ Floor 0\"],\"activatedEscalator\":[\"Stair id 0 @ level 0\",\"Stair id 1 @ level 0\",\"Stair id 2 @ level 0\",\"Stair id 0 @ level 2\",\"Stair id 1 @ level 2\",\"Stair id 2 @ level 2\",\"Stair id 3 @ level 2\",\"Stair id 4 @ level 2\",\"Stair id 5 @ level 2\",\"Stair id 6 @ level 2\",\"Stair id 7 @ level 2\",\"Stair id 8 @ level 2\",\"Stair id 9 @ level 2\",\"Stair id 0 @ level 3\",\"Stair id 1 @ level 3\",\"Stair id 2 @ level 3\",\"Stair id 3 @ level 3\",\"Stair id 4 @ level 3\",\"Stair id 5 @ level 3\",\"Stair id 0 @ level 5\",\"Stair id 1 @ level 5\"],\"activatedAccess\":[\"Door 0 @ Floor 0\"]}",
            "batchId": "1467884877675",
            "lastRequestCommand": "start"
          }
        ]
      }
    ]
    ``` 

    
**Get Simulation Status**
----
  Returns the status of the web server status

* **URL**

  /SimulationControl/?command=status

* **Method:**

  `GET`
  
*  **URL Params**

   None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200
  
    **Content:** `{"message":"Hello world, service is running"}`

**Register Simulator**
----
  Returns the status of the web server status

* **URL**

  /SimulationControl/?command=registerInstance

* **Method:**

  `GET`
  
*  **URL Params**

   `instanceId = [integer]`
   
   `instanceProcessId = [integer]`
* **Data Params**

  None

* **Success Response:**

  * **Code:** 200


**Get Last Request**
----
  Returns the last request command of the instance. There are 3 different status: START, STOP, FINISHED

* **URL**

  /SimulationControl/?command=getLastRequestCommand

* **Method:**

  `GET`
  
*  **URL Params**

   `instanceId = [integer]`
   
   `instanceProcessId = [integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200
  
    **Content:** `{"message":"<status>"}`

**Upload results data**
----
  Uploads finished results

* **URL**

  /SimulationControl/?command=uploadPercentileData

* **Method:**

  `POST`
  
*  **URL Params**

   `instanceId = [integer]`
   
   `instanceProcessId = [integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200
 