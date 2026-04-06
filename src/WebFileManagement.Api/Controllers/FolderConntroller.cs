using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebFIleManagement.Services.Service;
using WebFIleManagement.Services.Service.Interfaces;

namespace WebFileManagement.Api.Controllers;

[Route("api/folder")]
[ApiController]
public class FolderConntroller : ControllerBase
{
   private readonly IStorageService _storageService;
    public FolderConntroller()
    {
        _storageService = new StorageService();
    }
    [HttpPost]
    public IActionResult CreateFolder([FromQuery] string folderPath)
    {
        try
        {
            _storageService.CreateFolder(folderPath);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpDelete]
    public IActionResult DeleteFolder([FromQuery] string folderPath)
    {
        try
        {
            _storageService.DeleteFolder(folderPath);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] string folderPath = "")
    {
        try
        {
            var result = _storageService.GetAll(folderPath);
            return Ok(result);
             
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet]
    [Route("download-zip")]
    public async Task<IActionResult> DownloadFolderAsZip([FromQuery] string folderPath)
    {
        try
        {
            var stream = await _storageService.DownloadFolderAsZipAsync(folderPath);
            var folderName = Path.GetFileName(folderPath);
            return File(stream, "application/zip", $"{folderName}.zip");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}