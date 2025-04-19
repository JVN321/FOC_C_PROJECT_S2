#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// Function to decode URL-encoded strings
void url_decode(char *src) {
    char *dst = src;
    char a, b;
    while (*src) {
        if (*src == '%' && *(src + 1) && *(src + 2)) {
            a = src[1];
            b = src[2];
            if (a >= '0' && a <= '9') a = a - '0';
            else if (a >= 'a' && a <= 'f') a = a - 'a' + 10;
            else if (a >= 'A' && a <= 'F') a = a - 'A' + 10;
            else {
                *dst++ = *src++;
                continue;
            }
            if (b >= '0' && b <= '9') b = b - '0';
            else if (b >= 'a' && b <= 'f') b = b - 'a' + 10;
            else if (b >= 'A' && b <= 'F') b = b - 'A' + 10;
            else {
                *dst++ = *src++;
                continue;
            }
            *dst++ = (a << 4) | b;
            src += 3;
        } else if (*src == '+') {
            *dst++ = ' ';
            src++;
        } else {
            *dst++ = *src++;
        }
    }
    *dst = '\0';
}

// Extract field value from form data
char *get_field(char *data, const char *field_name) {
    char search_str[256];
    char *start, *end;
    
    sprintf(search_str, "%s=", field_name);
    start = strstr(data, search_str);
    
    if (!start) return NULL;
    start += strlen(search_str);
    
    end = strchr(start, '&');
    if (!end) end = start + strlen(start);
    
    int length = end - start;
    
    // Allocate dynamic memory for the value
    char *value = (char*)malloc(length + 1);
    if (!value) return NULL;
    
    strncpy(value, start, length);
    value[length] = '\0';
    url_decode(value);
    
    return value;
}

// Get current date and time as string
char* get_current_datetime() {
    static char datetime[64];
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    strftime(datetime, sizeof(datetime), "%Y-%m-%d %H:%M:%S", t);
    return datetime;
}

// Save feedback in JSON format
void save_feedback_json(char *data) {
    char *type = get_field(data, "type");
    char *name = get_field(data, "name");
    char *branch = get_field(data, "branch");
    char *semester = get_field(data, "semester");
    char *department = get_field(data, "department");
    char *subject = get_field(data, "subject");
    char *feedback = get_field(data, "feedback");
    char *datetime = get_current_datetime();
    

    FILE *f = fopen("feedback.json", "r+");
    
    if (!f) {
        f = fopen("feedback.json", "w+");
        if (!f) {
            perror("Error opening feedback file");
            return;
        }
    }

    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    
    if (size == 0) {
        fprintf(f, "[\n");
    } else {
        // Move back before the last ']' to add a comma
        fseek(f, -2, SEEK_END);
        fprintf(f, ",\n");
    }
    
    // Write the feedback entry in JSON format
    fprintf(f, "  {\n");
    fprintf(f, "    \"type\": \"%s\",\n", type ? type : "general");
    fprintf(f, "    \"name\": \"%s\",\n", name ? name : "Anonymous");
    if (branch) fprintf(f, "    \"branch\": \"%s\",\n", branch);
    if (semester) fprintf(f, "    \"semester\": \"%s\",\n", semester);
    if (department) fprintf(f, "    \"department\": \"%s\",\n", department);
    if (subject) fprintf(f, "    \"subject\": \"%s\",\n", subject);
    fprintf(f, "    \"feedback\": \"%s\",\n", feedback ? feedback : "");
    fprintf(f, "    \"date\": \"%s\"\n", datetime);
    fprintf(f, "  }\n]");
    
    fclose(f);
    
    if (type) free(type);
    if (name) free(name);
    if (branch) free(branch);
    if (semester) free(semester);
    if (department) free(department);
    if (subject) free(subject);
    if (feedback) free(feedback);
}

// Display feedback entries
void list_feedback() {
   
    printf("Content-Type: application/json\r\n\r\n");

    FILE *f = NULL;

    f = fopen("feedback.json", "r");

    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    
    if (size == 0) {
        printf("{}");
        fclose(f);
        return;
    }
    
    char *json_data = (char*)malloc(size + 1);    
    size_t bytes_read = fread(json_data, 1, size, f);
    json_data[bytes_read] = '\0';
    fclose(f);
    

    int has_brackets = (json_data[0] == '[' && json_data[bytes_read - 1] == ']');
    
    if (has_brackets) {
        json_data[bytes_read - 1] = '\0';
        printf("%s", json_data + 1);
    } else {
        printf("%s", json_data);
    }
    
    free(json_data);
}

int main() {
    char *query_string = getenv("QUERY_STRING");
    char *request_method = getenv("REQUEST_METHOD");
    
    // Handle GET requests for listing feedback
    if (request_method && strcmp(request_method, "GET") == 0) {
        if (query_string && strstr(query_string, "action=list")) {
            list_feedback();
            return 0;
        }
        
        // Default GET response - show a simple form
        printf("Content-Type: text/html\r\n\r\n");
        printf("<html><body>");
        printf("<h1>Feedback System</h1>");
        printf("<p>Please visit our <a href=\"../index.html\">homepage</a> to submit feedback.</p>");
        printf("</body></html>");
        return 0;
    }
    
    // Handle POST requests for submitting feedback
    printf("Content-Type: text/html\r\n\r\n");
    
    char *len_str = getenv("CONTENT_LENGTH");
    int len = len_str ? atoi(len_str) : 0;
    
    if (len <= 0) {
        printf("<h1>Error: No input received.</h1>");
        return 1;
    }
    
    char *data = malloc(len + 1);
    if (!data) {
        printf("<h1>Error: Memory error</h1>");
        return 1;
    }
    
    fread(data, 1, len, stdin);
    data[len] = '\0';
    
    // Check if there is feedback data
    if (strstr(data, "feedback=")) {
        save_feedback_json(data);
    } else {
        printf("<h1>Error: Feedback not found</h1>");
    }
    
    free(data);
    return 0;
}
