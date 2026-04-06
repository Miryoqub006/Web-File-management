using System.IO.Compression;
using WebFIleManagement.Broker.Service.Interfaces;

namespace WebFIleManagement.Broker.Service;

public class LocalStorageBroker : IStorageBroker
{

    private readonly string _basePath;

    public LocalStorageBroker()
    {

        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "Data");

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public void CreateFolder(string folderPath)
    {
        var currentPath = Path.Combine(_basePath, folderPath);
        var parentPath = Directory.GetParent(currentPath);

        if (parentPath != null)
        {
            EnsureDirectoryExists(parentPath.FullName);
        }
        EnsureDirectoryNotExists(currentPath);

        Directory.CreateDirectory(currentPath);
    }

    public void DeleteFile(string filePath)
    {
        var currentPath = Path.Combine(_basePath, filePath);

        EnsureFileExists(currentPath);

        File.Delete(currentPath);

    }

    public void DeleteFolder(string folderPath)
    {
        EnsureDirectoryExists(Path.Combine(_basePath, folderPath));

        Directory.Delete(Path.Combine(_basePath, folderPath), true);
    }

    public async Task<Stream> DownloadFileAsync(string filePath)
    {
        var currentPath = Path.Combine(_basePath, filePath);
        EnsureFileExists(currentPath);

        return new FileStream(currentPath, FileMode.Open,
            FileAccess.Read,
            FileShare.Read, 4096,
            useAsync: true);

    }

    public async Task<Stream> DownloadFolderAsZipAsync(string folderPath)
    {
        var currentPath = Path.Combine(_basePath, folderPath);
        EnsureDirectoryExists(currentPath);

        return await Task.Run(() =>
        {
            var zipFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.zip");
            ZipFile.CreateFromDirectory(currentPath, zipFilePath);
            return new FileStream(
                zipFilePath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                4096,
                FileOptions.Asynchronous | FileOptions.DeleteOnClose);
        });



    }

    public async Task EditFileAsync(string filePath, string content)
    {
        var currentPath = Path.Combine(_basePath, filePath);
        EnsureFileExists(currentPath);
        var parentPath = Directory.GetParent(currentPath);
        EnsureDirectoryExists(parentPath.FullName);

        var txt = currentPath.EndsWith(".txt", StringComparison.OrdinalIgnoreCase);
        if (!txt)
        {
            throw new Exception($"The file '{currentPath}' is not a text file.");
        }

         await File.WriteAllTextAsync(currentPath, content);



    }

    public IEnumerable<string> GetAll(string folderPath)
    {

        //if(folderPath is null)
        //{
        //    var entr = Directory.GetFileSystemEntries(_basePath);
        //    return entr.Select(Path.GetFileName).ToList();
        //}

        var currentPath = Path.Combine(_basePath, folderPath);


        EnsureDirectoryExists(currentPath);

        var entries = Directory.GetFileSystemEntries(currentPath);

        return entries.Select(Path.GetFileName);


    }

    public async Task<string> GetTextOfFileAsync(string filePath)
    {
        var currentPath = Path.Combine(_basePath, filePath);
        EnsureFileExists(currentPath);
        var txt = currentPath.EndsWith(".txt", StringComparison.OrdinalIgnoreCase);
        if (!txt)
        {
            throw new Exception($"The file '{currentPath}' is not a text file.");
        }

        var text = await File.ReadAllTextAsync(currentPath);
        return text;
    }

    public async Task UploadFileAsync(string filePath, Stream stream)
    {
        var currentPath = Path.Combine(_basePath, filePath);
        var parentPath = Directory.GetParent(currentPath);


        if (parentPath != null)
        {
            EnsureDirectoryExists(parentPath.FullName);
        }



        //using (var fileStream = new FileStream(currentPath, FileMode.CreateNew)) 
        //{

        //    await stream.CopyToAsync(fileStream);
        //}.

        byte[] buffer = new byte[8192]; // 8 KB buffer

        using (var fileStream = new FileStream(currentPath, FileMode.Create))
        {
            int bytesRead;
            while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                await fileStream.WriteAsync(buffer, 0, bytesRead);
            }
        }
    }

    private void EnsureFileNotExists(string path)
    {
        if (File.Exists(path))
        {
            throw new Exception($"The file '{path}' already exist.");
        }
    }

    private void EnsureDirectoryNotExists(string path)
    {
        if (Directory.Exists(path))
        {
            throw new Exception($"The directory '{path}' already  exists.");
        }
    }
    private void EnsureDirectoryExists(string path)
    {
        if (!Directory.Exists(path))
        {
            throw new Exception($"The directory '{path}' does not  exists.");
        }
    }
    private void EnsureFileExists(string path)
    {
        if (!File.Exists(path))
        {
            throw new Exception($"The file '{path}' does not  exists.");
        }
    }
}
