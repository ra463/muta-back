const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { cacheDirectory } = require("../puppeteer.config.cjs");
const dotenv = require("dotenv");

dotenv.config({ path: "../config/config.env" });

exports.resetPasswordCode = (email, name, code) => {
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const options = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Code",
    html: `<div
      class="container"
      style="font-family: 'Roboto', sans-serif; margin: 0 auto"
    >
      <div class="head" style="display: flex; align-items: center">
        <img
          src="https://res.cloudinary.com/drt2oqpbj/image/upload/v1688817758/finder_teqvxk.png"
          alt=""
          width="40px"
          height="40px"
          style="transform: translateY(10px);mix-blend-mode: multiply"
        />
        <h2 style="margin: 0;padding: 0;margin-top: 5px;margin-left: 10px;padding-bottom: 16px">
          Code for Resetting Your Password
        </h2>
      </div>
      <div
        class="row"
        style="
              padding: 1rem 0;
              border-top: 1px solid #e5e5e5;
              border-bottom: 1px solid #e5e5e5;
              padding-top: 0;
            "
      >
        <div class="col-12" style="text-align: center">
          <img
            src="https://media.istockphoto.com/id/1338629648/vector/mail-approved-vector-flat-conceptual-icon-style-illustration-eps-10-file.jpg?s=612x612&w=0&k=20&c=o6AcZk3hB6ShxOzmssuOcsfh0QYEQVJ0nCuEZZj1_nQ="
            alt="img"
            style="width: 200px;mix-blend-mode: multiply"
          />
          <p style="font-weight: bold; padding: 0; margin: 0">
            Hey ${name}, You have requested for resetting your password.
          </p>
          <p style="padding: 0; margin: 0">
            Here is your code for resetting your password. Please enter this code to reset your password:
          </p>
          <p style="font-weight: bold;font-size: 1.5rem;padding: 0; margin: 0">
            ${code}
          </p>
          <p style="padding-bottom: 0; margin-bottom: 0">
            If you haven't requested this mail, then please contact us on our helpline number <span style="font-weight: bold">+91 1234567890</span>.
          </p>
          <p
            style="
                  padding-bottom: 0;
                  margin-bottom: 0;
                  color: #949090;
                  font-size: 0.8rem;
                "
          >
            Regards, Team <span style="color: #ff5c35">MutaEngine</span>
          </p>
        </div>
      </div>
    </div>`,
  };

  smtpTransport.sendMail(options, (err, res) => {
    if (err) return err;
    return res;
  });
};

exports.sendInvoice = async (product, email, name) => {
  let alltotal = 0;
  let grandtotal = 0;

  product.forEach((item) => {
    alltotal += item.p_quantity * item.p_price;
  });

  grandtotal = alltotal + (alltotal * 18) / 100;

  try {
    // const userDataDir = await fs.mkdtemp(
    //   path.join(os.tmpdir(), "puppeteer_temp")
    // );
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const htmlTemplate = `<div
      style="
        display: flex;
        flex-direction: column;
        margin: 0 2.5rem;
        gap: 3rem;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
          sans-serif;
      "
    >
      <div style="display: flex; justify-content: space-between">
        <div>
          <h2 style="margin-bottom: 7px">
            <strong>INVOICE GENERATOR</strong>
          </h2>
          <span>Sample Output should be this</span>
        </div>
        <div>
          <h2 style="margin-bottom: 7px; font-weight: 500">MutaEngine</h2>
        </div>
      </div>
      <div
        style="
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
            sans-serif;
        "
      >
        <ul
          style="
            padding-left: 0;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ebebeb;
            padding-bottom: 1rem;
          "
        >
          <li style="font-weight: bold; list-style: none">Product Name</li>
          <li style="font-weight: bold; list-style: none">Qty</li>
          <li style="font-weight: bold; list-style: none">Price</li>
          <li style="font-weight: bold; list-style: none">Total</li>
        </ul>
        ${product
          .map(
            (item, index) => `
          <ul
            key=${index}
            style="
              padding-left: 0;
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              margin-bottom: 2rem;
            "
          >
            <li style="list-style: none">${item.p_name}</li>
            <li style="list-style: none; color: #7f88bd">${item.p_quantity}</li>
            <li style="list-style: none">${item.p_price}</li>
            <li style="list-style: none">INR ${alltotal}</li>
          </ul>
        `
          )
          .join("")}
        <div style="border-top: 2px solid #ebebeb; margin-top: 1.5rem">
          <div
            style="
              display: flex;
              float: right;
              flex-direction: column;
              gap: 1rem;
              width: 40%;
              margin-top: 1rem;
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span style="font-weight: bold">Total</span><span>INR ${alltotal}</span>
            </div>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span>GST</span><span style="color: rgb(180, 180, 180)">18%</span>
            </div>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 0;
                border-bottom: 2px solid #ebebeb;
                border-top: 2px solid #ebebeb;
              "
            >
              <span style="font-weight: bold">Grand Total (incl. GST - 18%)</span
              ><span style="color: #7f88bd">₹ ${grandtotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer
      style="
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
          sans-serif;margin-top: 5rem;
      "
    >
      <div style="font-size: 14px;padding-left: 2rem;margin-bottom:1.5rem;">
        <span style="font-weight: bold">Valid Until</span>: 22/09/24
      </div>
      <div style="background-color: #2d2c2c; color: white; padding: 1px 3rem;border-radius: 50px;margin: 0 1rem;">
        <p style="background-color: #2d2c2c; margin-bottom: 0; font-weight: bold; font-size: 14px">
          Terms and Conditions
        </p>
        <p style="background-color: #2d2c2c; margin-top: 0; font-size: 13px">
          We are happy to supply any further information you need and trust that
          you call on us to fill your order, which will receive our prompt and
          careful attention.
        </p>
      </div>
    </footer>`;

    await page.setContent(htmlTemplate);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    // await fs.rm(userDataDir, { recursive: true });

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const options = {
      from: process.env.EMAIL,
      to: email,
      subject: "Invoice from MutaEngine",
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      html: `<div
        class="container"
        style="font-family: 'Roboto', sans-serif; margin: 0 auto"
      >
        <div class="head" style="display: flex; align-items: center">
          <img
            src="https://res.cloudinary.com/drt2oqpbj/image/upload/v1688817758/finder_teqvxk.png"
            alt=""
            width="40px"
            height="40px"
            style="transform: translateY(10px);mix-blend-mode: multiply"
          />
          <h2 style="margin: 0;padding: 0;margin-top: 5px;margin-left: 10px;padding-bottom: 16px">
            Please find the attached invoice
          </h2>
        </div>
        <div
          class="row"
          style="
                padding: 1rem 0;
                border-top: 1px solid #e5e5e5;
                border-bottom: 1px solid #e5e5e5;
                padding-top: 0;
              "
        >
          <div class="col-12" style="text-align: center">
            <img
              src="https://media.istockphoto.com/id/1338629648/vector/mail-approved-vector-flat-conceptual-icon-style-illustration-eps-10-file.jpg?s=612x612&w=0&k=20&c=o6AcZk3hB6ShxOzmssuOcsfh0QYEQVJ0nCuEZZj1_nQ="
              alt="img"
              style="width: 200px;mix-blend-mode: multiply"
            />
            <p style="font-weight: bold; padding: 0; margin: 0">
              Hey ${name}, Thank you for shopping with us.
            </p>
            <p style="padding-bottom: 0; margin-bottom: 0">
              If you haven't requested this mail, then please contact us on our helpline number <span style="font-weight: bold">+91 1234567890</span>.
            </p>
            <p
              style="
                    padding-bottom: 0;
                    margin-bottom: 0;
                    color: #949090;
                    font-size: 0.8rem;
                  "
            >
              Regards, Team <span style="color: #ff5c35">MutaEngine</span>
            </p>
          </div>
        </div>
      </div>`,
    };

    smtpTransport.sendMail(options, (err, res) => {
      if (err) return err;
      return res;
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error sending invoice:", error);
    throw error;
  }
};
