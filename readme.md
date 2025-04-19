# FOC and C Project

## Prerequisites

- GCC compiler
- Python 3.x

## Build Instructions

To compile the C program into a CGI executable:

```bash
gcc cgi-bin/c_program.c -o cgi-bin/c_program.cgi
```

## Run Instructions

To start the CGI-enabled web server:

```bash
python -m http.server --cgi 8000
```

The server will start on port 8000. You can access the application by opening a web browser and navigating to:

```
http://localhost:8000
```

## Usage

1. Navigate to the CGI program through your browser
2. Follow the on-screen instructions to interact with the application

## Project Structure

- `/cgi-bin`: Contains the C program and compiled CGI executable
- Other directories and files as relevant to the project
