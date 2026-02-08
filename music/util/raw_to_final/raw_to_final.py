from pypdf import Transformation
import pypdf

coverReader = pypdf.PdfReader("./in/cover.pdf")
sheetsReader = pypdf.PdfReader("./in/sheets.pdf")

outWriter = pypdf.PdfWriter()

coverPage = coverReader.pages[0]
outWriter.add_page(coverPage)

numPages = len(sheetsReader.pages)

for i in range(numPages):
    print("On page ", i)
    page = sheetsReader.pages[i]
    scale = 1.4; 
    page.add_transformation(Transformation().scale(sx=scale, sy=scale))
    page.add_transformation(Transformation().translate(
                    -100, 
                    -245
                ))

    nb = page.mediabox.top * 0.07
    page.mediabox.lower_left = (
        page.mediabox.left,
        nb
    )

    outWriter.add_page(page)

outWriter.write("./out/out.pdf")