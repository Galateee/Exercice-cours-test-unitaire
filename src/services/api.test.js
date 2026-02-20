import axios from "axios";
import apiService from "./api";

// Mock axios
jest.mock("axios");

describe("API Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch users successfully", async () => {
      const mockUsers = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          age: 25,
          postalCode: "75001",
          city: "Paris",
        },
      ];

      axios.get.mockResolvedValue({ data: mockUsers });

      const users = await apiService.getUsers();

      expect(axios.get).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users");
      expect(users).toEqual(mockUsers);
    });

    it("should handle error when fetching users fails", async () => {
      const errorMessage = "Network Error";
      axios.get.mockRejectedValue(new Error(errorMessage));

      await expect(apiService.getUsers()).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users");
    });
  });

  describe("createUser", () => {
    it("should create user successfully (201)", async () => {
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        age: 28,
        postalCode: "69001",
        city: "Lyon",
      };

      const mockResponse = { ...newUser, id: 101 };
      axios.post.mockResolvedValue({ data: mockResponse });

      const result = await apiService.createUser(newUser);

      expect(axios.post).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users", newUser);
      expect(result).toEqual(mockResponse);
    });

    it("should handle 400 error (duplicate email)", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "existing@example.com",
        age: 30,
        postalCode: "75001",
        city: "Paris",
      };

      const error = new Error("Email already exists");
      error.response = { status: 400, data: { message: "Email already exists" } };
      axios.post.mockRejectedValue(error);

      await expect(apiService.createUser(userData)).rejects.toThrow("Email already exists");
      expect(axios.post).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users", userData);
    });

    it("should handle 500 error (server crash)", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        age: 25,
        postalCode: "33000",
        city: "Bordeaux",
      };

      const error = new Error("Internal Server Error");
      error.response = { status: 500, data: { message: "Internal Server Error" } };
      axios.post.mockRejectedValue(error);

      await expect(apiService.createUser(userData)).rejects.toThrow("Internal Server Error");
      expect(axios.post).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users", userData);
    });
  });
});
