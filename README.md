# Âm · Phòng luyện phát âm

Website tự học tiếng Việt từ “Tóm tắt lộ trình học phát âm”. 29 bài học, 128 câu luyện, 5 chủ đề; đủ phần nền tảng và 20 phần đánh số của PDF. Phần trọng âm và đồng hóa được chia thành bài nhỏ, số đầu tiêu đề giữ số phần trong tài liệu.

## Chạy trên máy

Yêu cầu Python 3. Không cần cài gói hay kết nối Internet để đọc bài và luyện tập.

```bash
cd pronunciation-review
python3 -m http.server 8000 --bind 127.0.0.1
```

Hoặc chạy `python3 start.py` trong thư mục này để tự mở trình duyệt. Trên Windows dùng `python start.py` hoặc `py start.py`.

Mở **http://localhost:8000** bằng Chrome, Edge, Firefox hoặc Safari. Giữ cùng địa chỉ/cổng và trình duyệt để dùng lại tiến độ. Dừng máy chủ bằng Ctrl+C. Không nên mở index.html trực tiếp vì cơ chế lưu trữ với file:// khác nhau giữa các trình duyệt.

## Cách học

1. Chọn “Bắt đầu phiên học”: ưu tiên thẻ đến hạn, sau đó bài chưa hoàn thành tiếp theo.
2. Đọc quy tắc, ghi chú và đọc thành tiếng ví dụ. Nhấn “Đánh dấu đã đọc” để mở thẻ của bài.
3. Luyện bài và đạt ít nhất 80% để hoàn thành. Điểm tốt nhất được giữ lại.
4. Ôn thẻ: tự nhớ rồi lật đáp án. Chọn mức nhớ để hẹn lại sau 1, 3 hoặc 7 ngày (mỗi ngày tương ứng 24 giờ). Mỗi phiên tối đa 20 thẻ.
5. Luyện lại câu sai cho đến khi trả lời đúng. Bài tổng hợp không thay điểm kiểm tra riêng của bài.

Các trang PDF ghi trong website là số trang thực tế từ 1–32. Tài liệu in số 25 hai lần, vì vậy các số in ở cuối tài liệu có thể khác số trang website. Mỗi bài có bản chữ trích xuất đầy đủ và liên kết PDF gốc. Bản trích xuất có thể còn lỗi định dạng hoặc ghi chú viết tay. Nội dung đã biên tập và ghi chú bổ sung được phân biệt trong bài; các xu hướng có ngoại lệ không được xem là quy tắc tuyệt đối.

## Nghe mẫu và dữ liệu

Dùng Web Speech API, ưu tiên en-US. Chọn giọng và tốc độ ở Cài đặt. Giọng có sẵn tùy hệ điều hành, một số giọng cần Internet. Nếu chưa có, cài giọng tiếng Anh trong thiết lập hệ điều hành. Giọng tổng hợp không đảm bảo thể hiện đúng mọi hiện tượng nối âm, flap T hoặc ngữ điệu, và không chấm phát âm.

Không có tài khoản, máy chủ dữ liệu, analytics, CDN hoặc API trả phí. Tiến độ lưu bằng localStorage trên trình duyệt. Chế độ riêng tư/xóa dữ liệu trình duyệt có thể làm mất tiến độ. Cài đặt có xuất/nhập JSON và xác nhận trước khi thay thế hoặc xóa dữ liệu. Nếu lưu trữ bị chặn, ứng dụng vẫn chạy trong phiên và hiển thị thông báo; hãy xuất bản sao trước khi đóng.

## Cấu trúc

- `index.html`, `styles.css`, `app.js`: giao diện và tương tác.
- `content.js`: bài học, ví dụ, câu hỏi và bản chữ các trang nguồn.
- `core.js`: tính điểm, lọc thẻ đến hạn, đặt lịch và kiểm tra bản sao.
- `assets/source.pdf`: tài liệu gốc.
- `tests/core.test.cjs`: kiểm tra dữ liệu và logic học bằng `node --test tests/core.test.cjs`.
- `tests/browser.py`: kiểm tra tích hợp bằng Python Playwright và Chromium có sẵn; chạy khi máy chủ ở cổng 8000 đang hoạt động. Đây là công cụ kiểm tra, không phải phụ thuộc chạy website.

Website có thể chạy local hoặc trên GitHub Pages. Tiến độ vẫn chỉ lưu trong trình duyệt, không đồng bộ lên GitHub. Tiến độ tại localhost không tự chuyển sang địa chỉ website; hãy xuất JSON ở địa chỉ cũ rồi nhập ở địa chỉ mới.

## Triển khai GitHub Pages

Trong repository GitHub, mở Settings → Pages → Build and deployment → Source và chọn **GitHub Actions**. Workflow `.github/workflows/pages.yml` chạy kiểm tra cú pháp và tests trước khi triển khai mỗi lần push lên `main`; có thể chạy lại từ Actions → Deploy GitHub Pages → Run workflow.

Địa chỉ dự kiến: https://ducnguyen73.github.io/pronunciation-review/. Workflow chỉ xuất HTML, CSS, JavaScript và PDF nguồn; không xuất tests, báo cáo audit hoặc cấu hình IDE. Trạng thái triển khai và URL thực tế nằm trong Actions và environment `github-pages`.

## Bản cải thiện sau dùng thử

- Trong cùng lượt mở website, bài luyện đang dở được giữ khi chuyển sang bài học hoặc điều hướng khác. Mở Luyện tập → “Tiếp tục bài đang làm” để quay lại đúng câu; bắt đầu một chế độ khác sẽ thay phiên đang dở. Tải lại hoặc đóng tab chưa khôi phục phiên này; điểm và lịch ôn đã lưu vẫn được giữ.
- Mobile ưu tiên nội dung; nút “Tới phần luyện tập” đưa tới phần thao tác cuối bài.
- Nút nghe lớn hơn, hướng dẫn thiếu giọng đọc đặt cố định trong bài, không che ví dụ.
- Cải thiện chữ IPA, độ rõ đáp án, focus khi chuyển câu và hiển thị lịch ôn tiếp theo.
- Báo cáo dùng thử có ảnh trước/sau ở `audit/index.html` hoặc `AUDIT.md`. Mở **http://localhost:8000/audit/** khi đang chạy máy chủ.
- Kiểm tra mới: `python3 tests/ux-review.py` (cùng yêu cầu Playwright và Chromium như kiểm tra tích hợp).
