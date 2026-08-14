# Nimbalyst calisma duzeni

Proje klasoru: `C:\Users\Ghost\Documents\Health-Intelligence-OS`

Varsayilan saglayici Codex/ChatGPT'tir. Ana oturum Sol ile orkestrasyon yapar; proje talimatlari basit isi Luna'ya, arastirmayi Terra'ya ve kritik incelemeyi Sol rollerine yollar. Alt ajanlar en fazla dordur.

Claude Code, Nimbalyst icinde ikinci ve bagimsiz saglayici olarak etkindir. Klinik konsey veya ikinci gorus istendiginde ayri Claude oturumu kullanilir; bu, Codex alt ajanlarindan ayri bir oturumdur.

Google Gemini, Nimbalyst'in varsayilan saglayicisidir ve Antigravity uzerinden calisir. Gemini oturumu hizli tarama, alternatif gorus ve model karsilastirmasi icin kullanilir. Pro aboneligi Antigravity uygulamasinda etkin Google hesabindan uygulanir. Eski Google hesaplari aktif hesap listesinden kaldirilmistir.

Programli Gemini ikinci gorusu icin:

```powershell
.\tools\Invoke-GeminiAgent.ps1 -Prompt "Gorevi bagimsiz incele" -Model gemini-3.1-pro-high
```

Nimbalyst'te bu klasoru ac ve Codex saglayicisiyla yeni oturum baslat. Ornek istek:

> MVP icin ilk dikey dilimi planla ve uygula. Orkestrasyon politikasina gore uygun model, efor ve ajan sayisini kendin sec; tum ajanlari bekle, testleri calistir ve sonucu birlestir.

Gercek hasta verisiyle gelistirme yapma. Ilk surumde sentetik veri kullan.
