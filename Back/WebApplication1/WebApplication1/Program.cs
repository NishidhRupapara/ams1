using BackendApi.Options;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Text.Json;
using WebApplication1.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbOptions>(
    builder.Configuration.GetSection("MongoDB"));

builder.Services.AddSingleton<IMongoClient>(s =>
    new MongoClient(builder.Configuration.GetValue<string>("MongoDB:ConnectionString")));

builder.Services.AddScoped<IMongoDatabase>(s =>
    s.GetRequiredService<IMongoClient>()
     .GetDatabase(builder.Configuration.GetValue<string>("MongoDB:Database")));

// Services
builder.Services.AddSingleton<MongoDbService>();

const string myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000", 
                    "http://localhost:4200",
                    "https://NishidhRupapara.github.io" // Added GitHub Pages origin
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// IMPORTANT: app.UseCors must be called after UseRouting and BEFORE UseAuthorization
app.UseRouting();

app.UseCors(myAllowSpecificOrigins); 

app.UseAuthorization();

app.MapControllers();

// --- MASTER DATABASE AUTO-GENERATION & SEEDING SCRIPT ---
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
        var collections = db.ListCollectionNames().ToList();
        
        var requiredCollections = new[] { 
            "faculties", "Faculty", "counters", "Counters", "Students", 
            "StudentTbl", "Attendance", "StudentAt", "F_Suggestion", 
            "Admin", "AdminNotice", "Department" 
        };

        foreach (var col in requiredCollections)
        {
            if (!collections.Contains(col))
            {
                db.CreateCollection(col);
                Console.WriteLine($"Created collection: {col}");
            }
        }

        // Seed Admin if empty
        var adminCol = db.GetCollection<BsonDocument>("Admin");
        if (adminCol.CountDocuments(new BsonDocument()) == 0)
        {
            adminCol.InsertOne(new BsonDocument {
                { "Aid", 1 },
                { "Username", "admin" },
                { "Password", "adminpassword" }
            });
            Console.WriteLine("Seeded default admin user.");
        }

        // Seed Counters if empty
        var countersCol = db.GetCollection<BsonDocument>("Counters");
        if (countersCol.CountDocuments(new BsonDocument()) == 0)
        {
            countersCol.InsertMany(new[] {
                new BsonDocument { { "_id", "Sid" }, { "Seq", 0L } },
                new BsonDocument { { "_id", "facultyid" }, { "Seq", 0L } },
                new BsonDocument { { "_id", "suggestionid" }, { "Seq", 0L } }
            });
            Console.WriteLine("Seeded counters.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database seeding skipped: {ex.Message}");
    }
}

app.Run();