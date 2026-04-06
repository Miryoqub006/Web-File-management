# 📂 Web File Management System

A robust ASP.NET Core Web API designed to manage server-side files and directories through a clean, structured interface. This project demonstrates high-performance file I/O operations and efficient data streaming.

---

## 🛠 Key Features

* **File Operations:** Full support for uploading, downloading, deleting, and renaming files.
* **Directory Management:** Create, list, and organize folders dynamically on the server.
* **Efficient Streaming:** Implemented using `FileStream` and `FileResult` to handle large files without exhausting server memory.
* **Path Validation:** Built-in security checks to prevent directory traversal attacks and ensure files are managed within authorized paths.
* **ZIP Compression:** Ability to compress multiple files or entire directories into a single archive for optimized downloads.

---

## 🏗 Technical Stack

* **Framework:** .NET 8 / ASP.NET Core Web API
* **File System:** `System.IO` (Drive, Directory, and File info)
* **API Documentation:** Swagger/OpenAPI for easy endpoint testing.
* **Architecture:** Controller-Service pattern for clean separation of business logic and HTTP concerns.Onion and Strategy Pattern 

---

## 🚀 How It Works (Endpoints)

| Action | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/files` | List all files and folders in the root directory. |
| **POST** | `/api/files/upload` | Upload a new file using `IFormFile`. |
| **GET** | `/api/files/download/{name}` | Download a specific file via stream. |
| **DELETE** | `/api/files/{name}` | Permanently remove a file from the server. |
| **GET** | `/api/files/zip` | Archive selected folder into a .zip file. |

---

## 💻 Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/yourusername/WebFileManagement.git](https://github.com/yourusername/WebFileManagement.git)
