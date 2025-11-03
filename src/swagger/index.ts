import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mikaelson Initiative API",
      version: "1.0.0",
      description: "Comprehensive API documentation for the Mikaelson Initiative platform - a social learning and community platform for developers and tech enthusiasts.",
      contact: {
        name: "Mikaelson Initiative Team",
        email: "support@mikaelsoninitiative.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.mikaelsoninitiative.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the user",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
            },
            username: {
              type: "string",
              description: "User's unique username",
            },
            firstName: {
              type: "string",
              description: "User's first name",
            },
            lastName: {
              type: "string",
              description: "User's last name",
            },
            profileImage: {
              type: "string",
              format: "uri",
              description: "URL to user's profile image",
            },
            coverImage: {
              type: "string",
              format: "uri",
              description: "URL to user's cover image",
            },
            bio: {
              type: "string",
              description: "User's bio/description",
            },
            isVerified: {
              type: "boolean",
              description: "Whether the user is verified",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the post",
            },
            content: {
              type: "string",
              description: "Post content/text",
            },
            authorId: {
              type: "string",
              format: "uuid",
              description: "ID of the post author",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of tags associated with the post",
            },
            mediaUrls: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
              },
              description: "Array of media file URLs",
            },
            likesCount: {
              type: "integer",
              description: "Number of likes on the post",
            },
            commentsCount: {
              type: "integer",
              description: "Number of comments on the post",
            },
            viewsCount: {
              type: "integer",
              description: "Number of views on the post",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Post creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Post last update timestamp",
            },
          },
        },
        Challenge: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the challenge",
            },
            title: {
              type: "string",
              description: "Challenge title",
            },
            description: {
              type: "string",
              description: "Challenge description",
            },
            creatorId: {
              type: "string",
              format: "uuid",
              description: "ID of the challenge creator",
            },
            startDate: {
              type: "string",
              format: "date-time",
              description: "Challenge start date",
            },
            endDate: {
              type: "string",
              format: "date-time",
              description: "Challenge end date",
            },
            isActive: {
              type: "boolean",
              description: "Whether the challenge is currently active",
            },
            membersCount: {
              type: "integer",
              description: "Number of members in the challenge",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Challenge creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Challenge last update timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            status: {
              type: "integer",
              description: "HTTP status code",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Error timestamp",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/routes/v1/*.ts"], // Path to your TypeScript route files
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Mikaelson Initiative API Documentation",
  }));
};

export default specs;
