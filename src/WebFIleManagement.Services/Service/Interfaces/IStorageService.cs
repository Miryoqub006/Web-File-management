using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace WebFIleManagement.Services.Service.Interfaces;

public interface IStorageService
{
    public void CreateFolder(string folderPath);
    public void DeleteFolder(string folderPath);
    public Task UploadFileAsync(Dictionary<string,Stream> fileStream);

    public void DeleteFile(string filePath);
    public Task<Stream> DownloadFileAsync(string filePath);
    public Task<Stream> DownloadFolderAsZipAsync(string folderPath);
    public IEnumerable<string> GetAll(string folderPath);
    public Task<string> GetTextOfFileAsync(string filePath);
    public Task EditFileAsync(string filePath, string content);
}
