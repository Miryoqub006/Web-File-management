using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WebFIleManagement.Broker.Service;
using WebFIleManagement.Broker.Service.Interfaces;
using WebFIleManagement.Broker.Service.StrategyPattern;
using WebFIleManagement.Services.Service.Interfaces;

namespace WebFIleManagement.Services.Service;

public class StorageService : IStorageService
{
    private readonly IStorageBroker _storageBroker;

    public StorageService()
    {
        _storageBroker = StorageFactory.GetStorageBroker(StorageType.Local);
    }
    public void CreateFolder(string folderPath)
    {
       _storageBroker.CreateFolder(folderPath);
    }

    public void DeleteFile(string filePath)
    {
        _storageBroker.DeleteFile(filePath);
    }

    public void DeleteFolder(string folderPath)
    {
        _storageBroker.DeleteFolder(folderPath);
    }

    public async Task<Stream> DownloadFileAsync(string filePath)
    {
        return await _storageBroker.DownloadFileAsync(filePath);
    }
    
    public Task<Stream> DownloadFolderAsZipAsync(string folderPath)
    {
        return _storageBroker.DownloadFolderAsZipAsync(folderPath);
    }

    public async Task EditFileAsync(string filePath, string content)
    {
       await _storageBroker.EditFileAsync(filePath, content);
    }

    public IEnumerable<string> GetAll(string folderPath)
    {
      return  _storageBroker.GetAll(folderPath);
    }

    public async Task<string> GetTextOfFileAsync(string filePath)
    {
        return await _storageBroker.GetTextOfFileAsync(filePath);
    }

    public async Task UploadFileAsync(Dictionary<string,Stream> fileStream)
    {
        foreach (var item in fileStream)
        {
            await _storageBroker.UploadFileAsync(item.Key, item.Value);
        }
    }

   
}
