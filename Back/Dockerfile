# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy the specific project file and restore dependencies
COPY ["Back/WebApplication1/WebApplication1.csproj", "./"]
RUN dotnet restore "WebApplication1.csproj"

# Copy the remaining source files and build
COPY . .
RUN dotnet publish -c Release -o out

# Stage 2: Generate the runtime image!
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "WebApplication1.dll"]