# Health Intelligence OS Orkestrasyon Politikasi

Bu proje hekim denetimli bir klinik karar destek platformudur. Bir AI doktor ya da otonom teshis/tedavi sistemi olarak davranma.

## Her iste uygulanacak yonlendirme

Once gorevi hizlica siniflandir. Kullanici ayrica istemese bile asagidaki politikayi uygula:

- Basit ve dar kapsamli is: tam olarak 1 `luna_worker` ajani ac, sonucu bekle ve kontrol ederek birlestir.
- Orta zorlukta arastirma veya kod tabani kesfi: 1 `terra_researcher` ac. Birbirinden bagimsiz iki arastirma hatti varsa en fazla 2 Terra ajani ac.
- Karmasik uygulama veya mimari degisiklik: ana ajan planlama ve birlestirmeyi ustlensin; bagimsiz is akisi sayisi kadar, en fazla 4 ajan ac. Rutin alt isleri Luna'ya, kesfi Terra'ya, kritik incelemeyi `sol_reviewer` rolune ver.
- Klinik, ilac, teshis, tedavi, hasta verisi, guvenlik veya mevzuat etkili is: en az 1 `clinical_safety` ajaniyla bagimsiz inceleme yaptir. Uygulama ile incelemeyi ayni ajana verme.
- Gorev paralel bolunemiyorsa gereksiz ajan acma. Ajan sayisini dosya sayisina gore degil, birbiriyle cakismaz bagimsiz is akisi sayisina gore sec.

Ana ajan alt ajanlarin sonuclarini bekler, celiskileri cozer, ilgili testleri calistirir ve tek bir sonuc sunar. Ayni dosyayi eszamanli olarak birden fazla yazan ajana verme. Varsayilan eszamanli alt ajan siniri 4'tur.

## Model ve efor

- Luna / low: acik, tekrarlanabilir, dar kapsamli isler.
- Terra / medium: kesif, tarama, belge ve gereksinim analizi.
- Sol / high: karmasik mantik, mimari ve bagimsiz inceleme.
- Sol / xhigh: klinik guvenlik, gizlilik ve kritik risk degerlendirmesi.

Eforu sirf daha guclu gorundugu icin yukseltme. Yalnizca belirsizlik, geri donusu zor karar veya hasta guvenligi etkisi gerektiriyorsa yukselt.

## Saglik verisi ve guvenlik sinirlari

- Gelistirme ve testte yalnizca sentetik veya geri dondurulemez bicimde kimliksizlestirilmis veri kullan.
- Isim, kimlik numarasi, adres, telefon, tam dogum tarihi ve benzeri dogrudan tanimlayicilari model saglayicilarina gonderme.
- Klinik oneriler kaynak, belirsizlik ve insan onayi gereksinimini acikca tasir.
- Acil durum, teshis ve tedavi akislari doktor onayi olmadan son kullaniciya kesin karar olarak sunulmaz.
- Kanit seviyesi ile anekdotu ayir; uydurma yuzdeler veya kalibre edilmemis olasiliklar uretme.

## Claude kullanimi

Claude Code, Nimbalyst icinde bagimsiz ikinci saglayicidir. Kullanici Claude ile ikinci gorus veya karsilastirma istediginde ayri bir Claude Code oturumu ac; ilk turun sonucunu diger modele gostermeden bagimsiz cevap al, sonra celiskileri ana orkestratorle birlestir.

## Gemini kullanimi

Gemini, Nimbalyst icinde Antigravity saglayicisi uzerinden bagimsiz ucuncu saglayicidir ve Nimbalyst'in varsayilan saglayicisidir. Hizli ve yuksek hacimli tarama, alternatif yaklasim veya ikinci gorus istendiginde ayri bir Gemini oturumu kullan.

Codex ana orkestratoru Gemini'den programli ikinci gorus alacaksa `tools/Invoke-GeminiAgent.ps1` aracini kullan:

- Basit ve yuksek hacimli isler: `gemini-3.7-flash-low` veya `gemini-3.7-flash-medium`.
- Zor bagimsiz inceleme: `gemini-3.1-pro-high`.
- Varsayilan mod `plan` ve salt okunurdur. Dosya degisikligi ancak kullanici acikca istediginde `accept-edits` moduyla yapilir.

Klinik konseyde ilk tur goruslerini birbirinden bagimsiz al; daha sonra Codex ana orkestratoru celiskileri ve ortak noktalarini birlestirsin. Gercek hasta verisini Gemini'ye gonderme.
