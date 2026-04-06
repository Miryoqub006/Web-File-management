
using WebFIleManagement.Services.Service;
using WebFIleManagement.Services.Service.Interfaces;

namespace WebFileManagement.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader());
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Xizmatlarni (Services) ro'yhatdan o'tkazamiz
            builder.Services.AddScoped<IStorageService, StorageService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // app.UseHttpsRedirection(); // Development uchun o'chirildi

            app.UseCors("AllowAll");
            app.UseDefaultFiles(); // index.html avtomatik ochilishi uchun
            app.UseStaticFiles();  // wwwroot dan fayllarni o'qish uchun

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
