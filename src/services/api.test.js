import axios from "axios";
import apiService from "./api";

jest.mock("axios");

describe("API Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch users successfully and transform JSONPlaceholder format", async () => {
      const mockApiResponse = [
        {
          id: 1,
          name: "Leanne Graham",
          username: "Bret",
          email: "Sincere@april.biz",
          address: {
            street: "Kulas Light",
            suite: "Apt. 556",
            city: "Gwenborough",
            zipcode: "92998-3874",
            geo: { lat: "-37.3159", lng: "81.1496" },
          },
          phone: "1-770-736-8031 x56442",
          website: "hildegard.org",
          company: {
            name: "Romaguera-Crona",
            catchPhrase: "Multi-layered client-server neural-net",
            bs: "harness real-time e-markets",
          },
        },
        {
          id: 2,
          name: "Ervin Howell",
          username: "Antonette",
          email: "Shanna@melissa.tv",
          address: {
            street: "Victor Plains",
            suite: "Suite 879",
            city: "Wisokyburgh",
            zipcode: "90566-7771",
            geo: { lat: "-43.9509", lng: "-34.4618" },
          },
          phone: "010-692-6593 x09125",
          website: "anastasia.net",
          company: {
            name: "Deckow-Crist",
            catchPhrase: "Proactive didactic contingency",
            bs: "synergize scalable supply-chains",
          },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiResponse });

      const users = await apiService.getUsers();

      expect(axios.get).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users");

      expect(users).toHaveLength(2);
      expect(users[0]).toEqual({
        id: 1,
        firstName: "Leanne",
        lastName: "Graham",
        email: "sincere@april.biz",
        age: 25,
        city: "Gwenborough",
        postalCode: "92998",
        timestamp: expect.any(String),
      });
      expect(users[1]).toEqual({
        id: 2,
        firstName: "Ervin",
        lastName: "Howell",
        email: "shanna@melissa.tv",
        age: 26,
        city: "Wisokyburgh",
        postalCode: "90566",
        timestamp: expect.any(String),
      });
    });

    it("should handle error when fetching users fails", async () => {
      const errorMessage = "Network Error";
      axios.get.mockRejectedValue(new Error(errorMessage));

      await expect(apiService.getUsers()).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users");
    });

    it("should handle missing address data with fallback values", async () => {
      const mockApiResponse = [
        {
          id: 3,
          name: "SingleName",
          email: "TEST@EXAMPLE.COM",
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiResponse });

      const users = await apiService.getUsers();

      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({
        id: 3,
        firstName: "SingleName",
        lastName: "User",
        email: "test@example.com",
        age: 27,
        city: "Unknown",
        postalCode: "00000",
        timestamp: expect.any(String),
      });
    });

    it("should handle missing city in address", async () => {
      const mockApiResponse = [
        {
          id: 4,
          name: "Test User",
          email: "test@example.com",
          address: {
            zipcode: "12345-6789",
          },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiResponse });

      const users = await apiService.getUsers();

      expect(users[0].city).toBe("Unknown");
      expect(users[0].postalCode).toBe("12345");
    });

    it("should handle missing zipcode in address", async () => {
      const mockApiResponse = [
        {
          id: 5,
          name: "Test User",
          email: "test@example.com",
          address: {
            city: "TestCity",
          },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiResponse });

      const users = await apiService.getUsers();

      expect(users[0].city).toBe("TestCity");
      expect(users[0].postalCode).toBe("00000");
    });

    it("should handle empty name with fallback to Unknown", async () => {
      const mockApiResponse = [
        {
          id: 6,
          name: "",
          email: "test@example.com",
          address: {
            city: "TestCity",
            zipcode: "12345",
          },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiResponse });

      const users = await apiService.getUsers();

      expect(users[0].firstName).toBe("Unknown");
      expect(users[0].lastName).toBe("User");
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
