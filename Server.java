import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

/**
 * Super simple, zero-dependency Built-in Java HTTP Server.
 * Run directly with: java Server.java
 * Opens on: http://localhost:8080
 */
public class Server {

    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null); // default executor
        System.out.println("==================================================");
        System.out.println("  Online Assignment Submission System Server");
        System.out.println("  Running at: http://localhost:" + PORT);
        System.out.println("  Press Ctrl + C to stop the server");
        System.out.println("==================================================");
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/")) {
                path = "/index.html";
            }

            File file = new File("." + path);
            if (!file.exists() || file.isDirectory()) {
                file = new File("./index.html");
            }

            String contentType = "text/html";
            if (file.getName().endsWith(".css")) {
                contentType = "text/css";
            } else if (file.getName().endsWith(".js")) {
                contentType = "application/javascript";
            } else if (file.getName().endsWith(".png")) {
                contentType = "image/png";
            }

            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, file.length());

            try (FileInputStream fis = new FileInputStream(file);
                 OutputStream os = exchange.getResponseBody()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                os.flush();
            }
        }
    }
}
