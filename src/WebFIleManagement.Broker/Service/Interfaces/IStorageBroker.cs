namespace WebFIleManagement.Broker.Service.Interfaces;

public interface IStorageBroker
{
    public void CreateFolder(string folderPath);
    public void DeleteFolder(string folderPath);
    public Task UploadFileAsync(string filePath, Stream stream);
    public void DeleteFile(string filePath);
    public Task<Stream> DownloadFileAsync(string filePath);
    public Task<Stream> DownloadFolderAsZipAsync(string folderPath);
    public IEnumerable<string> GetAll(string folderPath);
    public Task<string> GetTextOfFileAsync(string filePath);
    public Task EditFileAsync(string filePath, string content);
}
