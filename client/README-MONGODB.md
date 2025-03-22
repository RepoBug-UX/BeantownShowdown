# MongoDB Setup for Beantown Showdown

This guide explains how to set up MongoDB for the Beantown Showdown application.

## Setting Up MongoDB

1. **Create a MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account if you don't already have one.
   - Create a new project (e.g., "BeantownShowdown").

2. **Create a Cluster**

   - Create a new cluster (the free tier is sufficient for development).
   - Choose your preferred cloud provider and region.

3. **Set Up Database Access**

   - Go to the Security > Database Access section.
   - Add a new database user with a username and password.
   - Give this user "Read and Write to Any Database" permissions.

4. **Configure Network Access**

   - Go to the Security > Network Access section.
   - Add your current IP address to the allowlist.
   - For development, you can allow access from anywhere by adding `0.0.0.0/0`.

5. **Get Your Connection String**
   - Go to the Clusters page and click "Connect".
   - Choose "Connect your application".
   - Select "Node.js" as the driver and copy the connection string.
   - It will look like: `mongodb+srv://username:password@cluster0.mongodb.net/beantown?retryWrites=true&w=majority`
   - Replace `username` and `password` with your actual database username and password.

## Configure the Application

1. **Set Environment Variables**
   - Copy the `.env.local.example` file to `.env.local`.
   - Replace the placeholder MongoDB URI with your actual connection string.

```bash
cp .env.local.example .env.local
```

2. **Start the Application**
   - The application should now be able to connect to your MongoDB database.

```bash
npm run dev
```

## Database Structure

The application uses a database called `beantown` with the following collections:

- `projects`: Stores all fundraising projects
  - Fields include:
    - `title`: Project title
    - `description`: Brief project description
    - `category`: Project category
    - `fundingGoal`: Target funding amount
    - `raised`: Current amount raised
    - `backers`: Number of backers
    - `duration`: Campaign duration in days
    - `deadline`: End date of campaign
    - `status`: Project status (active, completed, etc.)
    - `image`: Project image URL
    - `creator`: Creator information
    - `milestones`: Array of project milestones
    - `updates`: Array of project updates

## API Endpoints

The application provides the following API endpoints for interacting with projects:

- `GET /api/projects`: Get all projects or a specific project with `?id=projectId`
- `POST /api/projects`: Create a new project
- `PATCH /api/projects?id=projectId`: Update an existing project
- `DELETE /api/projects?id=projectId`: Delete a project

## Testing the API

You can test the API using tools like Postman or curl:

```bash
# Get all projects
curl -X GET http://localhost:3000/api/projects

# Get a specific project
curl -X GET http://localhost:3000/api/projects?id=projectId

# Create a new project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Project","description":"Test Description","fundingGoal":1000,"category":"Technology","duration":30}'

# Update a project
curl -X PATCH http://localhost:3000/api/projects?id=projectId \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete a project
curl -X DELETE http://localhost:3000/api/projects?id=projectId
```

## Troubleshooting

- **Connection Issues**: Make sure your IP address is on the allowlist in MongoDB Atlas.
- **Authentication Issues**: Double-check your username and password in the connection string.
- **Database Operations**: Ensure your database user has the correct permissions.

For any other issues, check the server logs for detailed error messages.
