import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class aicteactivity {

private static final int PORT = 8081;
    private static final int BASE_POINTS = 75;
    private static final int TARGET = 100;
    private static final int POINTS_PER_CHECKIN = 5;
    private static final Path DATA_FILE = Path.of("aicte-data.properties");

    private static final ConcurrentMap<String, String> USERS = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, String> ROLES = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, String> DIVISIONS = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, String> TOKENS = new ConcurrentHashMap<>();

    private static final ConcurrentMap<String, StudentData> STUDENTS = new ConcurrentHashMap<>();
    private static final Object SAVE_LOCK = new Object();

    private static final class StudentData {
        int checkins;
        final List<String> timestamps = new ArrayList<>();
    }

    static {
        USERS.put("faculty", "demo123");
        ROLES.put("faculty", "faculty");

        String[][] roster = {
            {"a1", "Aarav Mehta", "A"}, {"a2", "Ananya Sharma", "A"},
            {"a3", "Arjun Nair", "A"}, {"a4", "Aditi Singh", "A"},
            {"a5", "Bhavya Patel", "A"}, {"a6", "Devansh Rao", "A"},
            {"a7", "Diya Kapoor", "A"}, {"a8", "Ishaan Verma", "A"},
            {"a9", "Kavya Iyer", "A"}, {"a10", "Rohan Desai", "A"},

            {"b1", "Kabir Joshi", "B"}, {"b2", "Meera Pillai", "B"},
            {"a3", "Nikhil Kulkarni", "B"}, {"b4", "Nisha Reddy", "B"},
            {"b5", "Pranav Gupta", "B"}, {"b6", "Riya Menon", "B"},
            {"b7", "Saanvi Bhatt", "B"}, {"b8", "Shaurya Jain", "B"},
            {"b9", "Tanvi Shetty", "B"}, {"b10", "Vivaan Saxena", "B"},

            {"c1", "Aisha Khan", "C"}, {"c2", "Aryan Bose", "C"},
            {"c3", "Charvi Mishra", "C"}, {"c4", "Dhruv Chauhan", "C"},
            {"c5", "Esha Rane", "C"}, {"c6", "Harsh Pandey", "C"},
            {"c7", "Ira Malhotra", "C"}, {"c8", "Kabir Sethi", "C"},
            {"c9", "Lavanya Das", "C"}, {"c10", "Mihir Roy", "C"},

            {"d1", "Myra Sinha", "D"}, {"d2", "Naitik Shah", "D"},
            {"d3", "Ojas Kadam", "D"}, {"d4", "Pari Naik", "D"},
            {"d5", "Reyansh Dutta", "D"}, {"d6", "Ridhima Bose", "D"},
            {"d7", "Samarth Kale", "D"}, {"d8", "Sara Fernandes", "D"},
            {"d9", "Tara Mukherjee", "D"}, {"d10", "Yash Thakur", "D"}
        };

        for (String[] s : roster) {
            String id = s[0], name = s[1], division = s[2];
            USERS.put(id, "demo123");
            ROLES.put(id, "student");
            DIVISIONS.put(id, division);
        }
    }

    private static final String[][] TIMETABLE = {
        {"A", "Monday", "09:00", "10:00", "DSA", "Prof. Mehta"},
        {"A", "Tuesday", "10:00", "11:00", "CN", "Prof. Iyer"},
        {"A", "Wednesday", "11:15", "12:15", "DSDCA", "Prof. Kulkarni"},
        {"A", "Thursday", "12:15", "13:15", "Math", "Prof. Rao"},
        {"A", "Friday", "13:15", "14:15", "UHV", "Prof. Deshmukh"},

        {"B", "Monday", "10:00", "11:00", "UHV", "Prof. Deshmukh"},
        {"B", "Tuesday", "11:15", "12:15", "DSA", "Prof. Mehta"},
        {"B", "Wednesday", "12:15", "13:15", "CN", "Prof. Iyer"},
        {"B", "Thursday", "13:15", "14:15", "DSDCA", "Prof. Kulkarni"},
        {"B", "Friday", "09:00", "10:00", "Math", "Prof. Rao"},

        {"C", "Monday", "11:15", "12:15", "Math", "Prof. Rao"},
        {"C", "Tuesday", "12:15", "13:15", "UHV", "Prof. Deshmukh"},
        {"C", "Wednesday", "09:00", "10:00", "DSA", "Prof. Mehta"},
        {"C", "Thursday", "10:00", "11:00", "CN", "Prof. Iyer"},
        {"C", "Friday", "11:15", "12:15", "DSDCA", "Prof. Kulkarni"},

        {"D", "Monday", "12:15", "13:15", "DSDCA", "Prof. Kulkarni"},
        {"D", "Tuesday", "09:00", "10:00", "Math", "Prof. Rao"},
        {"D", "Wednesday", "10:00", "11:00", "UHV", "Prof. Deshmukh"},
        {"D", "Thursday", "11:15", "12:15", "DSA", "Prof. Mehta"},
        {"D", "Friday", "12:15", "13:15", "CN", "Prof. Iyer"}
    };

    public static void main(String[] args) throws IOException {
        loadData();
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        server.createContext("/api/login", aicteactivity::handleLogin);
        server.createContext("/api/logout", aicteactivity::handleLogout);
        server.createContext("/api/me", aicteactivity::handleMe);
        server.createContext("/api/students", aicteactivity::handleStudents);
        server.createContext("/api/timetable", aicteactivity::handleTimetable);
        server.createContext("/api/checkin", aicteactivity::handleCheckin);
        server.createContext("/api/status", aicteactivity::handleStatus);

        server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
        server.start();

        System.out.println("CampusLoop backend running: http://localhost:" + PORT);
        System.out.println("Faculty login: faculty / demo123");
        System.out.println("Student examples: a1/demo123, b1/demo123, c1/demo123, d1/demo123");
    }

    private static void handleLogin(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "POST")) return;

        try {
            String body = readBody(ex);
            String username = lower(jsonString(body, "username"));
            String password = jsonString(body, "password");

            if (username == null || password == null || !password.equals(USERS.get(username))) {
                send(ex, 401, json("message", "Invalid username or password."));
                return;
            }

            String token = UUID.randomUUID().toString();
            TOKENS.put(token, username);

            String response = "{\"status\":\"success\",\"token\":\"" + token + "\","
                + "\"role\":\"" + ROLES.get(username) + "\","
                + "\"division\":\"" + escapeJson(DIVISIONS.getOrDefault(username, "")) + "\","
                + "\"name\":\"" + escapeJson(displayName(username)) + "\"}";

            send(ex, 200, response);
        } finally {
            ex.close();
        }
    }

    private static void handleLogout(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "POST")) return;

        try {
            String token = bearerToken(ex);
            if (token != null) TOKENS.remove(token);
            send(ex, 200, "{\"status\":\"success\"}");
        } finally {
            ex.close();
        }
    }

    private static void handleMe(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "GET")) return;

        try {
            String user = authenticatedUser(ex);
            if (user == null) {
                send(ex, 401, json("message", "Please log in again."));
                return;
            }

            String response = "{\"username\":\"" + escapeJson(user) + "\","
                + "\"name\":\"" + escapeJson(displayName(user)) + "\","
                + "\"role\":\"" + ROLES.get(user) + "\","
                + "\"division\":\"" + escapeJson(DIVISIONS.getOrDefault(user, "")) + "\"}";

            send(ex, 200, response);
        } finally {
            ex.close();
        }
    }

    private static void handleStudents(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "GET")) return;

        try {
            String user = authenticatedUser(ex);
            if (!"faculty".equals(ROLES.get(user))) {
                send(ex, 403, json("message", "Faculty access required."));
                return;
            }

            StringBuilder array = new StringBuilder("[");
            boolean first = true;

            for (String id : USERS.keySet()) {
                if (!"student".equals(ROLES.get(id))) continue;

                if (!first) array.append(",");
                first = false;

                array.append("{\"id\":\"").append(escapeJson(id)).append("\",")
                     .append("\"name\":\"").append(escapeJson(displayName(id))).append("\",")
                     .append("\"division\":\"").append(escapeJson(DIVISIONS.get(id))).append("\"}");
            }

            array.append("]");
            send(ex, 200, "{\"students\":" + array + "}");
        } finally {
            ex.close();
        }
    }

    private static void handleTimetable(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "GET")) return;

        try {
            String user = authenticatedUser(ex);
            if (user == null) {
                send(ex, 401, json("message", "Please log in again."));
                return;
            }

            String division = query(ex, "division");
            if (division == null || division.isBlank()) {
                division = DIVISIONS.getOrDefault(user, "A");
            }
            division = division.toUpperCase();

            StringBuilder array = new StringBuilder("[");
            boolean first = true;

            for (String[] row : TIMETABLE) {
                if (!row[0].equals(division)) continue;

                if (!first) array.append(",");
                first = false;

                array.append("{\"division\":\"").append(row[0]).append("\",")
                     .append("\"day\":\"").append(row[1]).append("\",")
                     .append("\"start\":\"").append(row[2]).append("\",")
                     .append("\"end\":\"").append(row[3]).append("\",")
                     .append("\"subject\":\"").append(row[4]).append("\",")
                     .append("\"faculty\":\"").append(escapeJson(row[5])).append("\"}");
            }

            array.append("]");
            send(ex, 200, "{\"division\":\"" + division + "\",\"timetable\":" + array + "}");
        } finally {
            ex.close();
        }
    }

    private static void handleCheckin(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "POST")) return;

        try {
            String username = authenticatedUser(ex);
            if (username == null) {
                send(ex, 401, json("message", "Please log in to check in."));
                return;
            }

            StudentData data = STUDENTS.computeIfAbsent(username, k -> new StudentData());

            synchronized (data) {
                if (BASE_POINTS + data.checkins * POINTS_PER_CHECKIN >= TARGET) {
                    send(ex, 409, json("message", "You have already reached the points target."));
                    return;
                }

                LocalDate today = LocalDate.now();

                for (String stamp : data.timestamps) {
                    LocalDate date = Instant.parse(stamp).atZone(ZoneId.systemDefault()).toLocalDate();
                    if (date.equals(today)) {
                        send(ex, 409, json("message", "You have already checked in today."));
                        return;
                    }
                }

                data.timestamps.add(Instant.now().toString());
                data.checkins++;
            }

            saveData();
            send(ex, 200, json("message", "Check-in recorded successfully."));
        } finally {
            ex.close();
        }
    }

    private static void handleStatus(HttpExchange ex) throws IOException {
        addCors(ex);
        if (preflightOrWrongMethod(ex, "GET")) return;

        try {
            String username = authenticatedUser(ex);
            if (username == null) {
                send(ex, 401, json("message", "Please log in again."));
                return;
            }

            StudentData data = STUDENTS.computeIfAbsent(username, k -> new StudentData());

            synchronized (data) {
                int points = Math.min(TARGET, BASE_POINTS + data.checkins * POINTS_PER_CHECKIN);

                String response = "{\"name\":\"" + escapeJson(displayName(username)) + "\","
                    + "\"division\":\"" + escapeJson(DIVISIONS.getOrDefault(username, "")) + "\","
                    + "\"points\":" + points + ","
                    + "\"target\":" + TARGET + ","
                    + "\"checkins\":" + data.checkins + ","
                    + "\"targetReached\":" + (points >= TARGET) + "}";

                send(ex, 200, response);
            }
        } finally {
            ex.close();
        }
    }

    private static boolean preflightOrWrongMethod(HttpExchange ex, String expected) throws IOException {
        String method = ex.getRequestMethod().toUpperCase();

        if (method.equals("OPTIONS")) {
            ex.sendResponseHeaders(204, -1);
            ex.close();
            return true;
        }

        if (!method.equals(expected)) {
            send(ex, 405, json("message", "Method not allowed."));
            ex.close();
            return true;
        }

        return false;
    }

    private static String authenticatedUser(HttpExchange ex) {
        String token = bearerToken(ex);
        return token == null ? null : TOKENS.get(token);
    }

    private static String bearerToken(HttpExchange ex) {
        String value = ex.getRequestHeaders().getFirst("Authorization");
        if (value == null || !value.startsWith("Bearer ")) return null;
        return value.substring(7).trim();
    }

    private static String readBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private static String query(HttpExchange ex, String key) {
        String raw = ex.getRequestURI().getQuery();
        if (raw == null) return null;

        for (String pair : raw.split("&")) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2 && parts[0].equals(key)) {
                return java.net.URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }

        return null;
    }

    private static String jsonString(String json, String field) {
        Pattern pattern = Pattern.compile(
            "\"" + Pattern.quote(field) + "\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\""
        );

        Matcher matcher = pattern.matcher(json);
        if (!matcher.find()) return null;

        return matcher.group(1)
            .replace("\\\"", "\"")
            .replace("\\\\", "\\");
    }

    private static String displayName(String username) {
        if ("faculty".equals(username)) return "Faculty Member";

        Map<String, String> names = new LinkedHashMap<>();
        names.put("a1", "Aarav Mehta");
        names.put("a2", "Ananya Sharma");
        names.put("a3", "Arjun Nair");
        names.put("a4", "Aditi Singh");
        names.put("a5", "Bhavya Patel");
        names.put("a6", "Devansh Rao");
        names.put("a7", "Diya Kapoor");
        names.put("a8", "Ishaan Verma");
        names.put("a9", "Kavya Iyer");
        names.put("a10", "Rohan Desai");

        names.put("b1", "Kabir Joshi");
        names.put("b2", "Meera Pillai");
        names.put("b4", "Nisha Reddy");
        names.put("b5", "Pranav Gupta");
        names.put("b6", "Riya Menon");
        names.put("b7", "Saanvi Bhatt");
        names.put("b8", "Shaurya Jain");
        names.put("b9", "Tanvi Shetty");
        names.put("b10", "Vivaan Saxena");

        names.put("c1", "Aisha Khan");
        names.put("c2", "Aryan Bose");
        names.put("c3", "Charvi Mishra");
        names.put("c4", "Dhruv Chauhan");
        names.put("c5", "Esha Rane");
        names.put("c6", "Harsh Pandey");
        names.put("c7", "Ira Malhotra");
        names.put("c8", "Kabir Sethi");
        names.put("c9", "Lavanya Das");
        names.put("c10", "Mihir Roy");

        names.put("d1", "Myra Sinha");
        names.put("d2", "Naitik Shah");
        names.put("d3", "Ojas Kadam");
        names.put("d4", "Pari Naik");
        names.put("d5", "Reyansh Dutta");
        names.put("d6", "Ridhima Bose");
        names.put("d7", "Samarth Kale");
        names.put("d8", "Sara Fernandes");
        names.put("d9", "Tara Mukherjee");
        names.put("d10", "Yash Thakur");

        return names.getOrDefault(username, username);
    }

    private static void loadData() throws IOException {
        if (!Files.exists(DATA_FILE)) return;

        Properties props = new Properties();

        try (var in = Files.newInputStream(DATA_FILE)) {
            props.load(in);
        }

        for (String username : USERS.keySet()) {
            if (!"student".equals(ROLES.get(username))) continue;

            StudentData data = new StudentData();
            data.checkins = parseInt(props.getProperty(username + ".count"), 0);

            String encoded = props.getProperty(username + ".timestamps", "");
            if (!encoded.isBlank()) {
                for (String item : encoded.split(",")) {
                    try {
                        data.timestamps.add(new String(
                            Base64.getDecoder().decode(item),
                            StandardCharsets.UTF_8
                        ));
                    } catch (IllegalArgumentException ignored) {
                    }
                }
            }

            STUDENTS.put(username, data);
        }
    }

    private static void saveData() throws IOException {
        synchronized (SAVE_LOCK) {
            Properties props = new Properties();

            for (var entry : STUDENTS.entrySet()) {
                StudentData data = entry.getValue();

                synchronized (data) {
                    props.setProperty(entry.getKey() + ".count", String.valueOf(data.checkins));

                    List<String> encoded = new ArrayList<>();
                    for (String stamp : data.timestamps) {
                        encoded.add(Base64.getEncoder()
                            .encodeToString(stamp.getBytes(StandardCharsets.UTF_8)));
                    }

                    props.setProperty(entry.getKey() + ".timestamps", String.join(",", encoded));
                }
            }

            Path temp = DATA_FILE.resolveSibling(DATA_FILE.getFileName() + ".tmp");

            try (var out = Files.newOutputStream(temp)) {
                props.store(out, "CampusLoop data");
            }

            Files.move(temp, DATA_FILE, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private static int parseInt(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return fallback;
        }
    }

    private static String json(String key, String value) {
        return "{\"" + key + "\":\"" + escapeJson(value) + "\"}";
    }

    private static String escapeJson(String value) {
        if (value == null) return "";

        return value.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private static String lower(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }

    private static void addCors(HttpExchange ex) {
        Headers headers = ex.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void send(HttpExchange ex, int code, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(code, bytes.length);
        ex.getResponseBody().write(bytes);
    }
}
