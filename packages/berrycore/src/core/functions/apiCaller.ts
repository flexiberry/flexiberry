import { ApiStatement, ApiStructure } from "../../lang/ast/Ast";

class ApiCaller {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async callApi(statement: ApiStructure): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statement),
      });
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error calling API:", error);
      throw error;
    }
  }
}
