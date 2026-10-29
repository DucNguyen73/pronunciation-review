# Kiểm tra bản bàn giao

## Mở rộng Luyện tập — 2026-10-29

- Ngân hàng: 1.201 câu cho 29 bài, tham chiếu đủ 32 trang; mỗi bài 11–88 câu. Giữ đủ 128 ID gốc. PDF, bản chữ nguồn và nội dung bài đọc/ví dụ tóm tắt không đổi. Xem `PRACTICE_COVERAGE.md` để đối chiếu nhóm ví dụ, ID và các hiệu chỉnh/ngoại lệ.
- 7 kiểm thử Node đạt: toàn vẹn ID/3 lựa chọn/lời giải/trang nguồn, lựa chọn bài và giá trị không hợp lệ, tương thích bản sao cũ, lịch ôn cũ/mới, điểm cao nhất, khoảng ôn và kiểm tra dữ liệu nhập. Cấu trúc hợp lệ không tự chứng minh mọi đáp án đúng về ngôn ngữ; nội dung được rà theo nhóm trong báo cáo đối chiếu.
- `tests/practice.browser.js` đạt qua Playwright CLI + Chrome Dev: nhớ bài khi đổi lựa chọn/điều hướng/tải lại, mở bài trực tiếp và tiếp tục bài cũ; làm hết 14 câu bài -ed; giải thích đúng phương án sau đảo thứ tự; mở giải thích còn lại/PDF; giữ điểm cũ; luyện tổng hợp 10 câu; luyện sai tối đa 20; mở và lên lịch thẻ mới; nhập bản sao schema cũ; lưu trữ bị chặn vẫn dùng được trong phiên.
- 6 tổ hợp phản hồi dài: sáng/tối × 1440/390/320 px không tràn ngang. Đã xem ảnh phản hồi đúng/sai ở `output/playwright/practice-*.png`; phần giải thích tổng quát không lặp lại nguyên đoạn đã có ở lời giải đáp án.
- Chạy lại `tests/browser.py` đạt: điều hướng, tìm kiếm, làm trọn 67 câu bài đầu, hoàn thành, lưu tiến độ, ôn thẻ, luyện sai, xuất/nhập/xóa có xác nhận, giả lập giọng/tốc độ, PDF, mobile và fallback khi chặn lưu trữ/thiếu speech API. `tests/ux-review.py` đạt: tiếp tục đúng câu/feedback, focus, nút nghe và 24 tổ hợp đường dẫn/kích thước; ảnh mới lưu trong `output/playwright/ux-regression`, không ghi đè bằng chứng audit cũ.
- Không có lỗi JavaScript trong các bộ kiểm tra trên. Server local có favicon.ico 404 riêng, không ảnh hưởng chức năng. Kiểm tra cú pháp JavaScript và `git diff --check` đạt. Đo 100 lượt tính thẻ đến hạn với cả ngân hàng được mở mất khoảng 5,3 ms trên máy này; đây là đo local, không là chứng nhận tải đa người dùng.
- Test Python hỗ trợ `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, `PRONUNCIATION_TEST_URL`; UX hỗ trợ `PRONUNCIATION_UX_OUTPUT` để giữ bằng chứng gốc. Lần này dùng Chrome Dev và cổng 8011, thư viện Python Playwright cài tạm ngoài repository.
- Chưa kiểm tra thay đổi này trên Safari/Firefox hoặc thiết bị thật, chưa nghe kiểm định từng ví dụ bằng giọng người. Phiên luyện dở không khôi phục qua tải lại theo phạm vi đã chốt. Chưa commit, push hoặc deploy.

## Chế độ tối — 2026-10-29

- Local Chrome Dev qua Playwright: đổi sáng/tối, trạng thái `aria-pressed`, giữ cả hai lựa chọn sau tải lại và đổi giao diện khi localStorage bị chặn đều đạt.
- 7 đường dẫn (home, lessons, lesson/l1, quiz/l1, review/l1, progress, settings) ở 1440, 390 và 320 px không tràn ngang trong chế độ tối. Đã sửa co giãn cột trang Tiến độ ở 320 px.
- Đã xem ảnh trang chủ tối, bài học mobile sáng/tối và phản hồi câu trả lời đúng/sai ở chế độ tối. Ảnh local trong `output/playwright/` (không đưa vào Git).
- 4 kiểm thử logic học hiện có, kiểm tra cú pháp app.js và `git diff --check` đều đạt. Không có lỗi JavaScript trong ca chặn localStorage; favicon.ico 404 của server local không ảnh hưởng ứng dụng.
- Khi triển khai GitHub Pages, trình duyệt có thể ghép HTML mới với JavaScript cũ trong cache. Các URL CSS/JavaScript của bản này dùng tham số phiên bản để tải đồng bộ. Chưa kiểm tra chế độ tối trên Safari hoặc thiết bị thật.

Ngày: 2026-10-22. Website local, không triển khai lên mạng.

## Đã kiểm tra

- Node: 4 nhóm kiểm tra đạt: 29 bài, 128 câu hỏi có đáp án hợp lệ, 32 trang PDF được tham chiếu; điều kiện hoàn thành; giữ điểm tốt nhất; lịch ôn 1/3/7 ngày và lọc thẻ chưa mở; xác thực bản sao JSON.
- Chromium thực qua Python Playwright: trang chủ không có hash, điều hướng, tìm kiếm/kết quả trống, học và hoàn thành bài, giữ tiến độ sau tải lại, lật thẻ và lên lịch, lưu và luyện lại câu sai, tải PDF.
- Xuất JSON, hủy xóa, xác nhận xóa, khôi phục bản sao tải xuống và từ chối tệp sai định dạng.
- Kiểm tra thiếu giọng đọc, thiếu API âm thanh và localStorage bị chặn: bài học vẫn dùng được, có thông báo hướng dẫn.
- Kiểm tra lựa chọn giọng en-US mặc định, đổi giọng, tốc độ qua mô phỏng Web Speech API. Máy kiểm tra không có giọng tiếng Anh nên chưa xác nhận chất lượng âm thanh thực tế bằng nghe.
- Kiểm tra liên kết bỏ qua điều hướng bằng bàn phím, giao diện desktop 1440px và mobile 390px. Các màn hình bài học, kiểm tra, thẻ, thư viện, cài đặt và tiến độ không tràn ngang ở kích thước mobile.
- Không có lỗi JavaScript trong lượt kiểm tra tích hợp cuối.

## Giới hạn

Chưa kiểm tra trực tiếp trên Safari, Firefox hoặc thiết bị iOS/Android thật. Giọng hệ thống tùy thiết bị và có thể cần Internet; giọng tổng hợp không đảm bảo thể hiện đầy đủ các biến thể phát âm. Bản trích xuất PDF giữ nội dung nguồn và có thể còn lỗi định dạng; bài tóm tắt có ghi chú về các quy tắc giản lược và ngoại lệ.

## Chạy lại

```bash
node tests/core.test.cjs
python3 -m http.server 8000 --bind 127.0.0.1
# Ở terminal khác, nếu có Python Playwright và /usr/bin/chromium:
python3 tests/browser.py
```

## Kiểm tra sau lượt dùng thử và cải thiện

Đã chạy lại 4 nhóm kiểm tra Node, toàn bộ `tests/browser.py` và `tests/ux-review.py`. Cả ba lượt đạt. Thử tiếp tục đúng câu và feedback sau khi xem bài học; kiểm tra nút nghe 70 × 44 px, bài học mobile ưu tiên quy tắc, ngày ôn tiếp, chuyển câu đưa nội dung vào màn hình và nhận focus. 24 tổ hợp trang/viewport ở 320, 390, 768, 1366 px không tràn ngang. Ảnh chụp trước/sau và giới hạn đánh giá được lưu ở `audit/index.html` và `AUDIT.md`.
