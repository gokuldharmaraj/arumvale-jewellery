import styles from "./MetalPrices.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Coins, CircleDollarSign, Medal, Gem } from "lucide-react";

function MetalPrices() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/metals");

        setPrices(res.data);
      } catch (err) {
        console.error("FULL ERROR:", err.response?.data || err.message);
      }
    };

    fetchPrices();
  }, []);

  return (
    <section className={`${styles.metalSection} section-light`}>
      <h2 className={styles.metalTitle}>Live Metal Prices (India)</h2>
      <p className={styles.metalSubtitle}>Updated from global market rates</p>

      <div className={styles.metalContainer}>
        <div className={styles.metalCard}>
          <Coins size={28} className={styles.metalIcon} />
          <h3>Gold</h3>
          <p>
            {prices.gold ? (
              prices.gold
            ) : (
              <span className={styles.loading}></span>
            )}
          </p>
        </div>

        <div className={styles.metalCard}>
          <CircleDollarSign size={28} className={styles.metalIcon} />
          <h3>Silver</h3>
          <p>
            {prices.silver ? (
              prices.silver
            ) : (
              <span className={styles.loading}></span>
            )}
          </p>
        </div>

        <div className={styles.metalCard}>
          <Medal size={28} className={styles.metalIcon} />
          <h3>Platinum</h3>
          <p>
            {prices.platinum ? (
              prices.platinum
            ) : (
              <span className={styles.loading}></span>
            )}
          </p>
        </div>

        <div className={styles.metalCard}>
          <Gem size={28} className={styles.metalIcon} />
          <h3>Diamond</h3>
          <p>{prices.diamond}</p>
        </div>
      </div>
    </section>
  );
}

export default MetalPrices;
