
# TeamSync - Internal Chat

TeamSync là một ứng dụng chat nội bộ thời gian thực dành cho các công ty, cho phép nhắn tin 1-1 và nhóm, chia sẻ văn bản, hình ảnh và tệp. Ứng dụng cũng tích hợp tính năng trả lời thông minh được hỗ trợ bởi AI để nâng cao hiệu quả giao tiếp.

## Cài đặt và Chạy ứng dụng

1.  **Cấu hình Firebase:** Mở tệp `services/firebase.ts` và điền đầy đủ thông tin cấu hình từ dự án Firebase của bạn. Nếu bạn thấy lỗi `400 Bad Request` khi đăng nhập, đó là do bước này chưa được hoàn thành.

2.  **Chạy ứng dụng:** Vì ứng dụng này sử dụng CDN và không có bước build, bạn chỉ cần mở tệp `index.html` trong một trình duyệt web thông qua một máy chủ cục bộ (live server).

## Quan trọng: Cài đặt Rules cho Firebase

Để ứng dụng hoạt động đúng và bảo mật, bạn **BẮT BUỘC** phải cài đặt các quy tắc (rules) cho Firestore và Storage. Các tệp `firestore.rules` và `storage.rules` đã được cung cấp, nhưng bạn cần tải chúng lên máy chủ Firebase.

### Yêu cầu

*   Cài đặt [Node.js](https://nodejs.org/) trên máy tính của bạn.
*   Cài đặt Firebase CLI (Command Line Interface) bằng cách chạy lệnh sau trong terminal:
    ```bash
    npm install -g firebase-tools
    ```

### Các bước cài đặt Rules

1.  **Đăng nhập Firebase:**
    Mở terminal trong thư mục gốc của dự án và chạy lệnh:
    ```bash
    firebase login
    ```
    Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào tài khoản Google đã tạo dự án Firebase.

2.  **Khởi tạo Firebase trong dự án:**
    Nếu bạn chưa từng làm điều này cho thư mục dự án, hãy chạy:
    ```bash
    firebase init
    ```
    Trong quá trình khởi tạo, hãy làm theo các bước sau:
    *   Chọn **"Use an existing project"** và chọn dự án Firebase của bạn từ danh sách.
    *   Khi được hỏi về các tính năng, sử dụng phím cách để chọn **Firestore** và **Storage**.
    *   Hệ thống sẽ hỏi về tệp quy tắc mặc định. Hãy chấp nhận các tên tệp mặc định (`firestore.rules` và `storage.rules`).
    *   **Quan trọng:** Lệnh `init` có thể tạo ra các tệp `firestore.rules` và `storage.rules` mới với nội dung mặc định. Hãy đảm bảo nội dung của các tệp này **giống hệt** với các tệp đã được cung cấp trong dự án. Nếu khác, hãy sao chép và dán nội dung từ các tệp đã có.
    *   Khi được hỏi "What do you want to use as your public directory?", hãy nhập `.` (một dấu chấm) và nhấn Enter.
    *   Khi được hỏi "Configure as a single-page app (rewrite all urls to /index.html)?", trả lời `No`.

3.  **Triển khai (Deploy) Rules:**
    Sau khi đã đăng nhập và khởi tạo, chạy lệnh sau để triển khai các quy tắc của bạn lên máy chủ Firebase:
    ```bash
    firebase deploy --only firestore:rules,storage:rules
    ```

    Nếu thành công, bạn sẽ thấy thông báo `✔  Deploy complete!`. Bây giờ, các quy tắc bảo mật cho cơ sở dữ liệu và lưu trữ tệp đã được áp dụng.

## Khắc phục sự cố

### Lỗi: `net::ERR_SOCKET_NOT_CONNECTED`

Nếu bạn thấy lỗi `net::ERR_SOCKET_NOT_CONNECTED` trong Bảng điều khiển dành cho nhà phát triển (Developer Console) của trình duyệt, đặc biệt là lỗi liên quan đến một URL như `cloudconsole-pa.clients6.google.com`, hãy hiểu rằng đây là một lỗi **mạng cấp thấp** và **không phải là lỗi trong mã nguồn của ứng dụng chat**.

URL `cloudconsole-pa...` là một dịch vụ nội bộ của Google Cloud Console và không được ứng dụng này gọi trực tiếp. Lỗi này thường chỉ ra sự cố với kết nối mạng của bạn, trình duyệt hoặc một dịch vụ bên ngoài.

**Các bước khắc phục sự cố:**

1.  **Kiểm tra kết nối Internet:** Đảm bảo bạn đang kết nối mạng ổn định.
2.  **Tải lại trang (Hard Refresh):** Thử tải lại trang bằng cách nhấn `Ctrl + Shift + R` (hoặc `Cmd + Shift + R` trên Mac) để xóa bộ nhớ cache và tải lại.
3.  **Thử chế độ ẩn danh (Incognito Mode):** Mở ứng dụng trong một cửa sổ ẩn danh. Nếu ứng dụng hoạt động ở chế độ này, một tiện ích mở rộng (extension) của trình duyệt có thể là nguyên nhân gây ra sự cố. Hãy thử tắt các tiện ích mở rộng, đặc biệt là các trình chặn quảng cáo hoặc VPN.
4.  **Kiểm tra Tường lửa / VPN / Proxy:** Nếu bạn đang sử dụng VPN, proxy hoặc có tường lửa nghiêm ngặt, chúng có thể đang chặn kết nối. Hãy thử tạm thời tắt chúng để xem sự cố có được giải quyết không.
5.  **Khởi động lại trình duyệt hoặc máy tính:** Đây là một bước đơn giản nhưng thường hiệu quả để giải quyết các sự cố mạng tạm thời.
