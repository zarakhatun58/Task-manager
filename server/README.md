{
  "info": {
    "name": "Smart Task Manager API",
    "_postman_id": "b1a79e5c-0c79-4f2c-a987-1f8c9f7e8120",
    "description": "Postman collection for Task Manager backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@gmail.com\",\n  \"password\": \"123456\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@gmail.com\",\n  \"password\": \"123456\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Teams",
      "item": [
        {
          "name": "Create Team",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Backend Team\",\n  \"members\": [\n    { \"name\": \"Arjun Patel\", \"role\": \"Backend Lead\", \"capacity\": 5 },\n    { \"name\": \"Meera\", \"role\": \"API Engineer\", \"capacity\": 3 },\n    { \"name\": \"Rahul\", \"role\": \"DB Engineer\", \"capacity\": 4 }\n  ]\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/teams",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "teams"]
            }
          }
        },
        {
          "name": "Get Teams",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/teams",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "teams"]
            }
          }
        }
      ]
    },
    {
      "name": "Projects",
      "item": [
        {
          "name": "Create Project",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"E-commerce Platform\",\n  \"teamId\": \"{{teamId}}\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/projects",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "projects"]
            }
          }
        },
        {
          "name": "Get Projects",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/projects",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "projects"]
            }
          }
        }
      ]
    },
    {
      "name": "Tasks",
      "item": [
        {
          "name": "Create Task",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Build API Routes\",\n  \"description\": \"Create all backend CRUD routes\",\n  \"projectId\": \"{{projectId}}\",\n  \"assignedMemberId\": \"{{memberId}}\",\n  \"priority\": \"High\",\n  \"status\": \"Pending\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/tasks",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "tasks"]
            }
          }
        },
        {
          "name": "Get Tasks",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/tasks?projectId={{projectId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "tasks"]
            }
          }
        },
        {
          "name": "Update Task",
          "request": {
            "method": "PUT",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"In Progress\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/tasks/{{taskId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "tasks", "{{taskId}}"]
            }
          }
        },
        {
          "name": "Delete Task",
          "request": {
            "method": "DELETE",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/tasks/{{taskId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "tasks", "{{taskId}}"]
            }
          }
        },
        {
          "name": "Auto Assign",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"projectId\": \"{{projectId}}\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/tasks/auto-assign",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "tasks", "auto-assign"]
            }
          }
        },
        {
          "name": "Reassign Tasks",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/tasks/reassign",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "tasks", "reassign"]
            }
          }
        }
      ]
    },
    {
      "name": "Activity Logs",
      "item": [
        {
          "name": "Get Activities",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/activity",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "activity"]
            }
          }
        }
      ]
    },
    {
      "name": "Dashboard",
      "item": [
        {
          "name": "Get Dashboard",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "{{token}}" }
            ],
            "url": {
              "raw": "http://localhost:5000/api/dashboard",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "dashboard"]
            }
          }
        }
      ]
    }
  ]
}
