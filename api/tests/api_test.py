import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3349"

class APITester:
    def __init__(self):
        self.agent_id = None
        self.user_id = "test_user_990" 

    def test_create_agent(self):
        print("\nTesting Create Agent...")
        url = f"{BASE_URL}/api/agents"
        
        payload = {
            "user_id": self.user_id,
            "config": {
                "llm": "Meta-Llama-3.1-8B-Instruct",
                "embeddings_model": "text-embedding-ada-002",
                "collection": "test_collection",
                "system_prompt": "You are a helpful assistant. Answer questions with this information {context}",
                "temperature": 0.7
            }
        }
        
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        self.agent_id = response.json()["id"]
        return response.json()

    def test_get_user_agents(self):
        print("\nTesting Get User Agents...")
        url = f"{BASE_URL}/api/agents/user/{self.user_id}"
        
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_update_agent(self):
        print("\nTesting Update Agent...")
        url = f"{BASE_URL}/api/agents/{self.agent_id}"
        
        payload = {
            "user_id": self.user_id,
            "config": {
                "llm": "Meta-Llama-3.1-8B-Instruct",
                "embeddings_model": "text-embedding-ada-002",
                "collection": "test_collection",
                "system_prompt": "You are a helpful assistant working for the company pikachu. Answer questions with this information {context}",
                "temperature": 0.8
            }
        }
        
        response = requests.patch(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_get_models(self):
        print("\nTesting Get Models...")
        url = f"{BASE_URL}/api/agents/models"
        
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()
    
    def test_upload_document(self):
        print("\nTesting Document Upload...")
        url = f"{BASE_URL}/api/agents/{self.agent_id}/documents"
        
        # Create a simple test PDF file
        test_file_content = ''
        with open('test.pdf', 'rb') as f:
            test_file_content = f.read()
        files = {
            'file': ('test.pdf', test_file_content, 'application/pdf')
        }
        
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_bulk_upload_documents(self):
        print("\nTesting Bulk Document Upload...")
        url = f"{BASE_URL}/api/agents/{self.agent_id}/documents/bulk"
        
        # Create multiple test PDF files
        test_file_content = ''
        with open('test.docx', 'rb') as f:
            test_file_content = f.read()
        files = [
            ('files', ('test1.pdf', test_file_content, 'application/pdf')),
            ('files', ('test2.pdf', test_file_content, 'application/pdf'))
        ]
        
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_chat(self):
        print("\nTesting Chat...")
        url = f"{BASE_URL}/api/agents/{self.agent_id}/chat"
        
        payload = {
            "agent_id": self.agent_id,
            "messages": [
                {"role": "user", "content": "Hello, who are you?"}
            ]
        }
        
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print("Streaming Response:")
        msg = ''
        for chunk in response.iter_content(chunk_size=None):
            if chunk:
                print(chunk.decode(), end='')
                msg += chunk.decode()
        
        assert response.status_code == 200
        assert 'pikachu' in msg.lower()
        return "Chat response received"

    def test_get_job_status(self, num_retries: int, wait_time_sec: int):
        print("\nTesting Get Job Status...")
        # Use the job_id from document upload
        job_id = self.test_upload_document()["job_id"]
        url = f"{BASE_URL}/api/agents/jobs/{job_id}"
        
        for _ in range(num_retries):
            response = requests.get(url)
            if response.status_code == 200:
                break
            time.sleep(wait_time_sec)

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        assert response.status_code == 200
        return response.json()

    def test_evaluate_agent(self):
        print("\nTesting Agent Evaluation...")
        url = f"{BASE_URL}/api/agents/{self.agent_id}/evaluate"
        
        # Create test evaluation set
        eval_data = [
            {
                "question": "What is the capital of France?",
                "answer": "The capital of France is Paris."
            },
            {
                "question": "What is 2+2?",
                "answer": "2+2 equals 4."
            }
        ]
        
        files = {
            'evaluation_set': ('eval.json', json.dumps(eval_data), 'application/json')
        }
        
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_get_evaluation_status(self, num_retries: int, wait_time_sec: int):
        print("\nTesting Get Evaluation Status...")
        # Use the job_id from evaluation
        job_id = self.test_evaluate_agent()["job_id"]
        url = f"{BASE_URL}/api/agents/evaluation-jobs/{job_id}"
        
        for _ in range(num_retries):
            response = requests.get(url)
            if response.status_code == 200:
                break
            time.sleep(wait_time_sec)

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_get_agent_metrics(self):
        print("\nTesting Get Agent Metrics...")
        start_date = (datetime.utcnow() - timedelta(days=7)).isoformat()
        end_date = datetime.utcnow().isoformat()
        
        url = f"{BASE_URL}/api/metrics/agent/{self.agent_id}"
        params = {
            'start_date': start_date,
            'end_date': end_date
        }
        
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_get_users(self):
        print("\nTesting Get Users...")
        url = f"{BASE_URL}/api/users"
        
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def test_delete_agent(self):
        print("\nTesting Delete Agent...")
        url = f"{BASE_URL}/api/agents/{self.agent_id}"
        params = {"user_id": self.user_id}
        
        response = requests.delete(url, params=params)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        return response.json()

    def run_all_tests(self):
        try:
            print("Starting API Tests...")
            self.test_create_agent()
            self.test_get_user_agents()
            self.test_update_agent()
            self.test_get_models()
            self.test_upload_document()
            self.test_bulk_upload_documents()
            self.test_get_job_status(5, 2)
            self.test_chat()
            self.test_evaluate_agent()
            self.test_get_evaluation_status(5,2)
            self.test_get_agent_metrics()
            self.test_get_users()
            self.test_delete_agent()
            print("\nAll tests completed successfully!")
            
        except AssertionError as e:
            print(f"\nTest failed: {str(e)}")
        except Exception as e:
            print(f"\nError occurred: {str(e)}")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()