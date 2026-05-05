# Stage 1: Build the application using .NET 10.0
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy the project file
COPY ["Back/WebApplication1/WebApplication1/WebApplication1.csproj", "./"]

# Restore dependencies
RUN dotnet restore "WebApplication1.csproj"

# Copy the remaining files and build
COPY . .
RUN dotnet publish -c Release -o out

# Stage 2: Generate the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "WebApplication1.dll"]