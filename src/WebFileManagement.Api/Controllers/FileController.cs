using Microsoft.AspNetCore.Mvc;
using WebFIleManagement.Services.Service;
using WebFIleManagement.Services.Service.Interfaces;

namespace WebFileManagement.Api.Controllers;

[Route("api/file")]
[ApiController]
public class FileController : ControllerBase
{
    private readonly IStorageService _storageService;

    public FileController()
    {
        _storageService = new StorageService();
    }


    [HttpDelete]
    public IActionResult DeleteFile([FromQuery] string filePath)
    {
        try
        {
            _storageService.DeleteFile(filePath);
            return Ok(new { message = "Fayl muvaffaqiyatli o'chirildi!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpPost]
    public async Task<IActionResult> UploadFile([FromForm]  List<IFormFile> file, [FromQuery] string? folderPath="")
    {
        try
        {
            Dictionary<string, Stream> fileStream = new Dictionary<string, Stream>();
            foreach (var f in file)
            {
                var fileName = Path.Combine(folderPath, f.FileName);
                fileStream.Add(fileName, f.OpenReadStream());
                
            }
            await _storageService.UploadFileAsync(fileStream);
            return Ok(new { message = "Fayllar muvaffaqiyatli yuklandi!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpGet]

    public async Task<IActionResult> DownloadFile([FromQuery] string filePath)
    {
        try
        {
            var stream = await _storageService.DownloadFileAsync(filePath);
            var fileName = Path.GetFileName(filePath);
            return File(stream, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpGet("text")]
    public async Task<IActionResult> GetTextOfFile([FromQuery] string filePath)
    {
        try
        {
            var text = await _storageService.GetTextOfFileAsync(filePath);
            return Ok(new { content = text });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> EditFile([FromQuery] string filePath, [FromBody] string content)
    {
        try
        {
            await _storageService.EditFileAsync(filePath, content);
            return Ok(new { message = "Fayl muvaffaqiyatli tahrirlandi!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}